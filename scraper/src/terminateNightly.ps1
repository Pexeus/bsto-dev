﻿Get-Process | where {$_.Description -like "Firefox Nightly"} | Stop-Process