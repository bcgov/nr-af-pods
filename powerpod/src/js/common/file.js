export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Define what happens when the file is successfully read
    reader.onload = function (event) {
      const base64String = event.target.result.split(',')[1]; // Extract base64 string from data URL
      resolve(base64String); // Resolve with the base64 encoded string
    };

    // Define what happens in case of an error
    reader.onerror = function (error) {
      reject(error);
    };

    // Read the file as a data URL (which includes base64 encoding)
    reader.readAsDataURL(file);
  });
}
