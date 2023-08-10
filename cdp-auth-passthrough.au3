Local $passthroughBinary = "\cdp-auth.exe" ; CDP binary
Local $numArgs = $CmdLine[0] ; Get total amount of args
Local $allArgs = "" ; Create arg store
For $i = 1 To $numArgs ; Loop through args
    $allArgs &= $CmdLine[$i] & " " ; Concatenate args to store
Next
$applicationPID = ShellExecute(@ScriptDir & $passthroughBinary, $allArgs, @ScriptDir, "", @SW_HIDE) ; Execute binary hidden
