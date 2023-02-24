import cv2
import pytesseract
# Load the image of the passport
img = cv2.imread('./nandini_pass.jpeg')

# Convert the image to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Apply thresholding to the image to enhance the text
threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

# Run OCR on the thresholded image
text = pytesseract.image_to_string(threshold)
print(text)