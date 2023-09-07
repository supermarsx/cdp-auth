#NoTrayIcon

#include <MsgBoxConstants.au3>

_Main()

;~ Main script loop
Func _Main()
	_InitialChecks()
	_ShowMessageBox()
EndFunc

;~ Initial checks
Func _InitialChecks()
	Local $iCmdArgsCurrent = $CmdLine[0] ; Get total amount of args
	Local $iCmdArgsNeeded = 3
	If $iCmdArgsCurrent <> $iCmdArgsNeeded Then
		Local $sMessageArgsMissing = StringFormat("%s needs %s arguments to run (hostname, userfield and password), %s were provided.", @ScriptName, $iCmdArgsNeeded, $iCmdArgsCurrent)
		_DebugQuit($sMessageArgsMissing)
	EndIf
EndFunc

;~ Show a message box
Func _ShowMessageBox()
	Local $sTitle = String($CmdLine[1])
	Local $sText = String($CmdLine[2])
	Local $isError = _ParseBoolean($CmdLine[3])
	Local $iMsgboxTimeout = 30
	Local $iFlag = $MB_ICONNONE
	If $isError = True Then $iFlag = $MB_ICONERROR
	MsgBox($iFlag, $sTitle, $sText, $iMsgboxTimeout)
EndFunc

;~ Parse boolean value from string
Func _ParseBoolean($sInput)
	$sNewInput = StringReplace( _
			StringLower( _
				String($sInput) _
			), _
		" ", "")

	Switch $sNewInput
        Case "true", "1", "yes", "on"
            Return True
        Case "false", "0", "no", "off"
            Return False
        Case Else
            Return False
    EndSwitch
EndFunc

;~ Handle debug and script quitting
Func _DebugQuit($sMessage)
	ConsoleWrite($sMessage & @CRLF)
	Local $sTitle = "Error"
	MsgBox($MB_ICONERROR, $sTitle, $sMessage)
	Exit
EndFunc