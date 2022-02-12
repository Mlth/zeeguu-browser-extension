/* Functions */
export function cleanImages(content) {
  const div = document.createElement("div");
  div.innerHTML = content;
  const firstImage = div.getElementsByTagName("img")[0];
  if (firstImage !== undefined) {
    firstImage.setAttribute("id", "zeeguuImage");
    let images = div.getElementsByTagName("img"),
      index;
    for (index = images.length - 1; index >= 0; index--) {
      if (index !== 0) {
        images[index].parentNode.removeChild(images[index]);
      }
    }
    content = div.innerHTML;
  }
  return content;
}

export function removeSVG(content) {
  const div = document.createElement("div");
  div.innerHTML = content;
  const allSVG = div.getElementsByTagName("svg");
  if (allSVG !== undefined) {
    let svg = allSVG,
      index;
    for (index = svg.length - 1; index >= 0; index--) {
      svg[index].parentNode.removeChild(svg[index]);
    }
    content = div.innerHTML;
  }
  return content;
}

export function removeLinks(content) {
  const div = document.createElement("div");
  div.innerHTML = content;
  var links = div.getElementsByTagName("a");
  while (links.length) {
    var parent = links[0].parentNode;
    while (links[0].firstChild) {
      parent.insertBefore(links[0].firstChild, links[0]);
    }
    parent.removeChild(links[0]);
  }
  content = div.innerHTML;
  return content;
}