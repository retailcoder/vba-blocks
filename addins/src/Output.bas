Attribute VB_Name = "Output"
Public Messages As New Collection
Public Warnings As New Collection
Public Errors As New Collection

Public Property Get Result() As String
    Dim Parts As New Dictionary
    Parts.Add "messages", Messages
    Parts.Add "warnings", Warnings
    Parts.Add "errors", Errors
    Parts.Add "success", Errors.Count = 0

    Result = JsonConverter.ConvertToJson(Parts)
End Property

