$env:GIT_SEQUENCE_EDITOR = "powershell -Command `"Get-Content rebase-todo.txt | Out-File -Encoding UTF8 rebase-temp.txt; Move-Item -Force rebase-temp.txt .git/rebase-merge/git-rebase-todo`"
cd "c:\Users\Administrator\Desktop\Park\diary-app"
git rebase -i HEAD~6 --no-autosquash
