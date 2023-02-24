import cv2

# Create a VideoCapture object
cap = cv2.VideoCapture(0)

# Capture the image
ret, frame = cap.read()

# Save the image
cv2.imwrite('captured_image.jpg', frame)

# Release the VideoCapture object
cap.release()

# Destroy all windows
cv2.destroyAllWindows()
