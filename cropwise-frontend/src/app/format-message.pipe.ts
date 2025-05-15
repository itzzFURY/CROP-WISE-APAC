import { Pipe, type PipeTransform } from "@angular/core"

@Pipe({
  name: "formatMessage",
  standalone: true,
})
export class FormatMessagePipe implements PipeTransform {
  transform(text: string): string {
    if (!text) return ""

    // Convert URLs to clickable links
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')

    // Convert line breaks to <br> tags
    text = text.replace(/\n/g, "<br>")

    // Format bold text
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Format italic text
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>")

    return text
  }
}
