export function announce(message: string) {
  const node = document.createElement("div");
  node.setAttribute("role", "status");
  node.setAttribute("aria-live", "polite");
  node.setAttribute("aria-atomic", "true");
  node.textContent = message;
  node.style.position = "absolute";
  node.style.width = "1px";
  node.style.height = "1px";
  node.style.padding = "0";
  node.style.margin = "-1px";
  node.style.overflow = "hidden";
  node.style.clip = "rect(0, 0, 0, 0)";
  node.style.whiteSpace = "nowrap";
  node.style.border = "0";
  document.body.appendChild(node);

  setTimeout(() => {
    document.body.removeChild(node);
  }, 1000);
}
