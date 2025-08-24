const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, " ") // normalize spaces
    .trim()
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-")
    )
    .join(" ");

export default toTitleCase;
