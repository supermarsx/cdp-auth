#NoTrayIcon ; Hide tray icon

#include <GUIConstants.au3>
#include <WindowsConstants.au3>
#include <WinApi.au3>
#include <WinAPIConstants.au3>
#include <MsgBoxConstants.au3>

_Main()

;~ Main script loop
Func _Main()
	_InitialChecks()
	_PortAvailabilityCheck()
	_LaunchCEFClient()
	_LaunchMainGUI()
	_LaunchCDPAuth()
	_InitialAutoResizeEnable()
	_MainGUILoop()
EndFunc

;~ Initial checks
Func _InitialChecks()
	_CheckCmdArguments()
	_SetExecutableNames()
	Local $aExecutables = [$sCefclientBinary, $sCdpAuthBinary, $sMessageBoxBinary]
	_CheckExecutablesExists($aExecutables)
EndFunc

;~ Check if command line arguments are enough
Func _CheckCmdArguments()
	Local $iArgsCurrent = Int($CmdLine[0])
	Local $iArgsNeeded = 3
	Local $sMessageArgsNeeded = StringFormat("%s needs %s arguments to run (hostname, userfield and password), %s were provided.", @ScriptName, $iArgsNeeded, $iArgsCurrent)
	If $iArgsCurrent <> $iArgsNeeded Then _DebugQuit($sMessageArgsNeeded)
EndFunc

;~ Set executable names globally
Func _SetExecutableNames()
	Global $sCefclientBinary = "\cefclient.exe" ; CEF client binary
	Global $sCdpAuthBinary = "\cdp-auth.exe" ; CDP binary
	Global $sMessageBoxBinary = "\messagebox.exe" ; Messagebox binary
EndFunc

;~ Check if a given executable exists
Func _CheckExecutablesExists($aExecutables)
	If IsArray($aExecutables) = 0 Then
		Local $sMessageExecutablesArrayFailed = "Executables check failed due to input not being an array."
		_DebugQuit($sMessageExecutablesArrayFailed)
	EndIf

	For $sExecutable In $aExecutables
		Local $sPath = StringFormat("%s%s", @ScriptDir, $sExecutable)
		Local $bFileExists = FileExists($sPath)
		If $bFileExists = 0 Then
			Local $sMessageExecutableNotFound = StringFormat("Executable doesn't exist: %s", $sExecutable)
			_DebugQuit($sMessageExecutableNotFound)
		EndIf
	Next
EndFunc

;~ Port availability check and port generator
Func _PortAvailabilityCheck()
	Global $DBG_PORT_LOWBOUND = 10200
	Global $DBG_PORT_HIGHBOUND = 13500
	Local $DBG_TCP_TIMEOUT = 125
	Local $DBG_PORTCHECK_TIMEOUT = 5000

	Local $sMessageStartup = "Starting up..."
	_Debug($sMessageStartup)
	TCPStartup()
	Local $sTcpTimeoutOption = "TCPTimeout"
	Opt($sTcpTimeoutOption, $DBG_TCP_TIMEOUT) ; Set timeout to low value

	Local $sIPAddress = "127.0.0.1" ; Localhost/loopback IP
	Global $iDebugPort = _GetDebugPort() ; Get a random remote debug port
	Local $bPortOk = False
	Local $iTimerPortCheck = TimerInit() ; Initialize port check timer
	Local $iSocket
	Local $bTimedOut = False

	$sMessagePortFree = StringFormat("Checking if port %s is free.", String($iDebugPort))
	_Debug($sMessagePortFree)

	;~ Debug port check if not in use
	While $bPortOk = False
		$iSocket = TCPConnect($sIPAddress, $iDebugPort) ; Try to connect to port
		If @error Then
			$bPortOk = True
			Local $sMessagePortUnvailable = "Port inaccessible, assuming port is free. Moving on."
			_Debug($sMessagePortUnvailable)
		Else
			$iDebugPort = _GetDebugPort()
			Local $sMessagePortNew = StringFormat("Testing new random port %s, previous port tested occupied.", String($iDebugPort))
			_Debug($sMessagePortNew)
		EndIf
		$bTimedOut = (TimerDiff($iTimerPortCheck) / 1000) > $DBG_PORTCHECK_TIMEOUT
		If $bTimedOut Then
			Local $sMessagePortFailed = "Port check failure by timeout."
			_DebugQuit($sMessagePortFailed)
		EndIf
	WEnd
	TCPCloseSocket($iSocket)
	TCPShutdown()
EndFunc

;~ Launch CEF Client on the background
Func _LaunchCEFClient()
	Local $sMessageCefClientLaunch = "Launching cefclient."
	_Debug($sMessageCefClientLaunch)
	Local $sCefParamAllowRemote = "--remote-allow-origins=*" ; Allow debug from any origin
	Global $sDebugPort = String($iDebugPort) ; Remote debug port to string
	Local $sCefParamDebugPort = StringFormat("--remote-debugging-port=%s", $sDebugPort) ; Remote cef debug port
	Local $sCefParamIgnoreCerts = "--ignore-certificate-errors" ; Ignore certificate errors
	Local $sCefStartingMessage = BinaryToString(_Base64("<p><span style=""font-family: 'Lucida Console', Monaco, monospace; font-size: 18px;"">Waiting for CDP connection...</span></p>"))
	Local $sCefParamUrlWaitCdp = StringFormat("--url=data:text/html;base64,%s", $sCefStartingMessage) ; Show waiting for cdp message
	Local $sCefParams = StringFormat("%s %s %s %s", $sCefParamAllowRemote, $sCefParamDebugPort, $sCefParamIgnoreCerts, $sCefParamUrlWaitCdp) ; All Cef client parameters
	Local $sCefParamsRun = StringFormat("%s%s %s", @ScriptDir, $sCefclientBinary, $sCefParams) ; All cef client running parameters
	Global $oCefPid = Run($sCefParamsRun, @ScriptDir, @SW_HIDE) ; Run cef client
	If @error Then
		Local $sMessageCefFailed = StringFormat("Failed to launch CEF client with run error: %s", @error)
		_DebugQuit($sMessageCefFailed)
	EndIf
EndFunc

;~ Launch the main GUI to embed CEF client into
Func _LaunchMainGUI()
	Local $sMessageLaunchGui = "Launching GUI."
	_Debug($sMessageLaunchGui)
	Local $sGuiBackgroundColor = 0x000000
	Local $iGuiInitialWidth = 800
	Local $iGuiInitialHeight = 600
	Local $sGuiTitle = "cefclient (embedded window)"
	Global $hGUI = GUICreate($sGuiTitle, $iGuiInitialWidth, $iGuiInitialHeight, -1, -1)
	GUICtrlSetResizing(-1, $GUI_DOCKLEFT + $GUI_DOCKRIGHT + $GUI_DOCKTOP)
	GUICtrlSetBkColor(-1, $sGuiBackgroundColor)
	WinWait($hGUI) ; Wait for GUI so embedding is successful on first try
	Global $hWnd = 0
	Local $stPID = DllStructCreate("int")
	Local $iHandleInterval = 35
	Local $bTimedOut = False
	Local $iHandleTimeout = 10000
	Local $iTimerHandle = TimerInit()
	Local $WinList
	Local $sMessageCefClientHandle = "Getting cefclient handle."
	_Debug($sMessageCefClientHandle)
	While $hWnd = 0 ; Get window handle for cefclient
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
		$bTimedOut = (TimerDiff($iTimerHandle) / 1000) > $iHandleTimeout
		If $bTimedOut Then
			Local $sMessageFailedGettingHandle = "Failed getting CEF client handle by timeout."
			ProcessClose($oCefPid)
			_DebugQuit($sMessageFailedGettingHandle)
		EndIf
		Sleep($iHandleInterval)
	WEnd
	If $hWnd <> 0 Then
		Local $sMessageEmbeddingWindow = "Embedding cefclient into GUI."
		_Debug($sMessageEmbeddingWindow)
		$nExStyle = DllCall("user32.dll", "int", "GetWindowLong", "hwnd", $hWnd, "int", -20)
		$nExStyle = $nExStyle[0]
		DllCall("user32.dll", "int", "SetParent", "hwnd", $hWnd, "hwnd", $hGUI)
		DllCall("user32.dll", "int", "SetWindowLongPtr", "hwnd", $hWnd, "hwnd", $hGUI)
		_WinAPI_ShowWindow($hWnd,@SW_HIDE)
		_WinAPI_SetWindowLong($hWnd, $GWL_STYLE, $WS_POPUPWINDOW)
		_WinAPI_ShowWindow($hWnd,@SW_SHOW)
		WinSetState($hWnd, "", @SW_SHOW)
		_ResizeEmbeddedWindow()
	Else
		ProcessClose($oCefPid)
		Local $sMessageEmbedFailed = "Failed to embed window."
		_DebugQuit($sMessageEmbedFailed)
	EndIf
	GUISetState()
EndFunc

;~ Launch CDP auth automation script
Func _LaunchCDPAuth()
	Local $sMessageLaunchCdp = "Launching cdp-auth."
	_Debug($sMessageLaunchCdp)
	Local $sParamSpacing = " "
	Local $iCdpTotalArgs = $CmdLine[0] ; Get total amount of args
	Local $sCdpArgs = "" ; Create arg store
	$sCdpArgs &= $sDebugPort & $sParamSpacing ; Add remote debug port
	For $i = 1 To $iCdpTotalArgs ; Loop through args
		$sCdpArgs &= $CmdLine[$i] & $sParamSpacing ; Concatenate args to store
	Next
	Local $sCdpExecutablePath = StringFormat("%s%s", @ScriptDir,  $sCdpAuthBinary)
	Local $oCdpPid = ShellExecute($sCdpExecutablePath, $sCdpArgs, @ScriptDir, "", @SW_HIDE) ; Execute binary hidden
	If @error Then
		Local $sMessageFailedCdp = StringFormat("Failed to launch CDP auth with shell execute error: %s", @error)
		_DebugQuit($sMessageFailedCdp)
	EndIf
EndFunc

;~ Enable window initial auto resize periodic check
Func _InitialAutoResizeEnable()
	Local $iAutoResizerTimeout = 2000
	Local $iAutoResizerInterval = 50
	AdlibRegister("_ResizeEmbeddedWindow", $iAutoResizerInterval) ; Enable initial embedded windows auto resize
	AdlibRegister("_InitialAutoResizeDisable", $iAutoResizerTimeout) ; Disable it after the timeout previously set
EndFunc

;~ Main GUI loop
Func _MainGUILoop()
	While 1
		Local $vGuiMsg = GUIGetMsg()
		If $vGuiMsg = $GUI_EVENT_RESIZED Then _ResizeEmbeddedWindow()
		If $vGuiMsg = -3 Then ExitLoop
	WEnd
EndFunc

;~ Handle debug messages
Func _Debug($sMessage)
	ConsoleWrite($sMessage & @CRLF)
EndFunc

;~ Handle debug and script quitting
Func _DebugQuit($sMessage)
	ConsoleWrite($sMessage & @CRLF)
	Local $sTitle = "Error"
	MsgBox($MB_ICONERROR, $sTitle, $sMessage)
	Exit
EndFunc

;~ Disable initial auto resize function
Func _InitialAutoResizeDisable()
	AdlibUnRegister("_ResizeEmbeddedWindow")
	AdlibUnRegister("_InitialAutoResizeDisable")
	_PeriodicAutoResizeEnable()
EndFunc

;~ Periodic windows auto resize
Func _PeriodicAutoResizeEnable()
	Local $iAutoResizerInterval = 1000
	AdlibRegister("_ResizeEmbeddedWindow", $iAutoResizerInterval)
EndFunc

;~ Resize embedded windows on resize
Func _ResizeEmbeddedWindow()
	Local $iWindowWidthPadding = 6
	Local $iWindowHeightPadding = 30
	Local $iWindowWidth = WinGetPos($hGUI)[2] - $iWindowWidthPadding
	Local $iWindowHeight = WinGetPos($hGUI)[3] - $iWindowHeightPadding
	Local $sEmptyText = ""
	Local $iPositionX = 0
	Local $iPositionY = 0
	WinMove($hWnd, $sEmptyText, $iPositionX, $iPositionY, $iWindowWidth, $iWindowHeight)
EndFunc

;~ Generate debug port
Func _GetDebugPort()
	Local $iIntegerFlag = 1
	Local $iDebugPort = Int(Random($DBG_PORT_LOWBOUND, $DBG_PORT_HIGHBOUND, $iIntegerFlag))
	Return $iDebugPort
EndFunc

;==============================================================================================================================
; Function:         base64($vCode [, $bEncode = True [, $bUrl = False]])
;
; Description:      Decode or Encode $vData using Microsoft.XMLDOM to Base64Binary or Base64Url.
;                   IMPORTANT! Encoded base64url is without @LF after 72 lines. Some websites may require this.
;
; Parameter(s):     $vData      - string or integer | Data to encode or decode.
;                   $bEncode    - boolean           | True - encode, False - decode.
;                   $bUrl       - boolean           | True - output is will decoded or encoded using base64url shema.
;
; Return Value(s):  On Success - Returns output data
;                   On Failure - Returns 1 - Failed to create object.
;
; Author (s):       (Ghads on Wordpress.com), Ascer
;===============================================================================================================================
Func _Base64($vCode, $bEncode = True, $bUrl = False)

    Local $oDM = ObjCreate("Microsoft.XMLDOM")
    If Not IsObj($oDM) Then Return SetError(1, 0, 1)

    Local $oEL = $oDM.createElement("Tmp")
    $oEL.DataType = "bin.base64"

    If $bEncode then
        $oEL.NodeTypedValue = Binary($vCode)
        If Not $bUrl Then Return $oEL.Text
        Return StringReplace(StringReplace(StringReplace($oEL.Text, "+", "-"),"/", "_"), @LF, "")
    Else
        If $bUrl Then $vCode = StringReplace(StringReplace($vCode, "-", "+"), "_", "/")
        $oEL.Text = $vCode
        Return $oEL.NodeTypedValue
    EndIf

EndFunc ;==>base64
