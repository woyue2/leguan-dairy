
const ui = {
  escapeHtml(text) {
    return text.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },
  processImageTags(text) {
    const imageRegex = /img:(https?:\/\/[^\s]+)/g
    return text.replace(imageRegex, (match, url) => {
      return `<img src="${this.escapeHtml(url)}" alt="图片" onerror="this.outerHTML='<span class=\\'image-placeholder\\'>图片加载失败</span>'">`
    })
  },
  extractFirstImageUrl(content) {
    const imageRegex = /img:(https?:\/\/[^\s]+)/
    const match = content.match(imageRegex)
    return match ? match[1] : null
  }
};

// 测试用例
const testCases = [
  "普通文本",
  "img:https://example.com/image.jpg",
  "前缀 img:https://example.com/image.png 后缀",
  "多图 img:https://a.com/1.jpg 和 img:https://b.com/2.png",
  "无效 img:ftp://example.com/image.jpg", // 只支持 http/https
  "带参数 img:https://example.com/image.jpg?w=100&h=100",
];

console.log("=== 测试 processImageTags ===");
testCases.forEach(text => {
  console.log(`Input: "${text}"`);
  console.log(`Output: "${ui.processImageTags(text)}"`);
  console.log("---");
});

console.log("\n=== 测试 extractFirstImageUrl ===");
testCases.forEach(text => {
  console.log(`Input: "${text}"`);
  console.log(`Output: "${ui.extractFirstImageUrl(text)}"`);
  console.log("---");
});
