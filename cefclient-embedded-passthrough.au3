#NoTrayIcon ; Hide tray icon

#include <GUIConstants.au3>
#include <WindowsConstants.au3>
#include <WinApi.au3>
#include <WinAPIConstants.au3>

$DBG_PORT_LOWBOUND = 10200
$DBG_PORT_HIGHBOUND = 13500
$DBG_TCP_TIMEOUT = 125
$DBG_PORTCHECK_TIMEOUT = 5000

ConsoleWrite("Starting up..." & @CRLF)
TCPStartup()
Opt("TCPTimeout", $DBG_TCP_TIMEOUT) ; Set timeout to low value
Local $sIPAddress = "127.0.0.1" ; Localhost/loopback IP
Local $iDebugPort = _GetDebugPort() ; Get a random remote debug port
Local $bPortOk = False
Local $iTimerPortCheck = TimerInit() ; Initialize port check timer
Local $iSocket

ConsoleWrite(StringFormat("Checking if port %s is free" & @CRLF, String($iDebugPort)))
;~ Debug port check if not in use
While $bPortOk = False
	$iSocket = TCPConnect($sIPAddress, $iDebugPort) ; Try to connect to port
	If @error Then
		$bPortOk = True
		ConsoleWrite("Port inaccessible, assuming port is free. Moving on." & @CRLF)
	Else
		$iDebugPort = _GetDebugPort()
		ConsoleWrite(StringFormat("Testing new random port %s, previous port tested occupied" & @CRLF, String($iDebugPort)))
	EndIf
	If (TimerDiff($iTimerPortCheck) / 1000) > $DBG_PORTCHECK_TIMEOUT Then
		ConsoleWrite("Port check failure by timeout, exiting")
		MsgBox(0, "Error", "Port check failure by timeout, exiting")
		Exit
	EndIf
WEnd
TCPCloseSocket($iSocket)
TCPShutdown()

ConsoleWrite("Launching cefclient" & @CRLF)
Local $sCefclientBinary = "\cefclient.exe" ; CEF client binary
Local $sCefParamAllowRemote = "--remote-allow-origins=*" ; Allow debug from any origin
Local $sDebugPort = String($iDebugPort) ; Remote debug port to string
Local $sCefParamDebugPort = StringFormat("--remote-debugging-port=%s", $sDebugPort) ; Remote cef debug port
Local $sCefParamIgnoreCerts = "--ignore-certificate-errors" ; Ignore certificate errors
Local $sCefParamUrlWaitCdp = "--url=data:text/html;base64,PHA+PHNwYW4gc3R5bGU9J2ZvbnQtZmFtaWx5OiAiTHVjaWRhIENvbnNvbGUiLCBNb25hY28sIG1vbm9zcGFjZTsgZm9udC1zaXplOiAxOHB4Oyc+V2FpdGluZyBmb3IgQ0RQIGNvbm5lY3Rpb24uLi48L3NwYW4+PC9wPg==" ; Show waiting for cdp message
Local $sCefParams = StringFormat("%s %s %s %s", $sCefParamAllowRemote, $sCefParamDebugPort, $sCefParamIgnoreCerts, $sCefParamUrlWaitCdp) ; All Cef client parameters
Local $sCefParamsRun = StringFormat("%s%s %s", @ScriptDir, $sCefclientBinary, $sCefParams) ; All cef client running parameters
$oCefPid = Run($sCefParamsRun, @ScriptDir, @SW_HIDE) ; Run cef client

ConsoleWrite("Launching GUI" & @CRLF)
$hGUI = GUICreate("cefclient (embedded window)", 800, 600, -1, -1, BitOr($WS_SIZEBOX, $WS_CAPTION, $WS_SYSMENU, $WS_CLIPCHILDREN))
GUICtrlSetResizing(-1, $GUI_DOCKLEFT + $GUI_DOCKRIGHT + $GUI_DOCKTOP)
GUICtrlSetBkColor(-1, 0x000000)
WinWait($hGUI) ; Wait for GUI so embedding is successful on first try
$hWnd = 0
$stPID = DllStructCreate("int")
ConsoleWrite("Getting cefclient handle" & @CRLF)
Do ; Get window handle for cefclient
    $WinList = WinList()
    For $i = 1 To $WinList[0][0]
        If $WinList[$i][0] <> "" Then
            DllCall("user32.dll", "int", "GetWindowThreadProcessId", "hwnd", $WinList[$i][1], "ptr", DllStructGetPtr($stPID))
            If DllStructGetData($stPID, 1) = $oCefPid Then
                $hWnd = $WinList[$i][1]
                ExitLoop
            EndIf
        EndIf
    Next
    Sleep(50)
Until $hWnd <> 0
If $hWnd <> 0 Then
	ConsoleWrite("Embedding cefclient into GUI" & @CRLF)
    $nExStyle = DllCall("user32.dll", "int", "GetWindowLong", "hwnd", $hWnd, "int", -20)
    $nExStyle = $nExStyle[0]
    DllCall("user32.dll", "int", "SetParent", "hwnd", $hWnd, "hwnd", $hGUI)
	DllCall("user32.dll", "int", "SetWindowLongPtr", "hwnd", $hWnd, "hwnd", $hGUI)
	_WinAPI_ShowWindow($hWnd,@SW_HIDE)
	_WinAPI_SetWindowLong($hWnd, $GWL_STYLE, $WS_POPUPWINDOW)
	_WinAPI_ShowWindow($hWnd,@SW_SHOW)
    WinSetState($hWnd, "", @SW_SHOW)
    WinMove($hWnd, "", 0, 0, WinGetPos($hGUI)[2]-6, WinGetPos($hGUI)[3]-30)
Else
	ProcessClose($oCefPid)
	ConsoleWrite("Failed to embed window, exiting" & @CRLF)
	MsgBox(0,"Error", "Failed to embed window, exiting")
	Exit
EndIf
GUISetState()

ConsoleWrite("Launching cdp-auth" & @CRLF)
Local $sCdpAuthBinary = "\cdp-auth.exe" ; CDP binary
Local $iCdpTotalArgs = $CmdLine[0] ; Get total amount of args
Local $sCdpArgs = "" ; Create arg store
$sCdpArgs &= $sDebugPort & " " ; Add remote debug port
For $i = 1 To $iCdpTotalArgs ; Loop through args
    $sCdpArgs &= $CmdLine[$i] & " " ; Concatenate args to store
Next
Local $sCdpExecutablePath = StringFormat("%s%s", @ScriptDir,  $sCdpAuthBinary)
Local $oCdpPid = ShellExecute($sCdpExecutablePath, $sCdpArgs, @ScriptDir, "", @SW_HIDE) ; Execute binary hidden

Local $iAutoResizerTimeout = 2000
AdlibRegister("_ResizeEmbeddedWindow", 50) ; Enabling initial embedded windows auto resize
AdlibRegister("_DisableInitialAutoResize", $iAutoResizerTimeout)

While 1
    Local $vGuiMsg = GUIGetMsg()
	If $vGuiMsg = $GUI_EVENT_RESIZED Then _ResizeEmbeddedWindow()
    If $vGuiMsg = -3 Then ExitLoop
WEnd

;~ Disable initial auto resize function
Func _DisableInitialAutoResize()
	AdlibUnRegister("_ResizeEmbeddedWindow")
	AdlibUnRegister("_DisableInitialAutoResize")
EndFunc

;~ Resize embedded windows on resize
Func _ResizeEmbeddedWindow()
	WinMove($hWnd, "", 0, 0, WinGetPos($hGUI)[2]-6, WinGetPos($hGUI)[3]-30)
EndFunc

;~ Generate debug port
Func _GetDebugPort()
	Local $iDebugPort = Random($DBG_PORT_LOWBOUND, $DBG_PORT_HIGHBOUND, 1)
	Return $iDebugPort
EndFunc


