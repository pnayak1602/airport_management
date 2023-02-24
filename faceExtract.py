#extract picture from the passport

import cv2
import numpy as np
import face_recognition
import dlib
# import cv2_imshow

# Load the cascade classifier
#face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
# Read the input image
img = cv2.imread("C:/Users/pnaya/Downloads/capture.png")

# Convert into grayscale
gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Detect faces
faces = face_cascade.detectMultiScale(gray_img, scaleFactor=1.1, minNeighbors=5)
# cv2_imshow(faces)
# Draw a rectangle around the faces
for (x, y, w, h) in faces:
    cv2.rectangle(img, (x-10,y-10), (x+w+10, y+h+10), (0, 255, 0), 3)
# from google.colab.patches import cv2_imshow

# Iterate over the faces
#for (x, y, w, h) in faces:
    # Extract the face region from the image
(x,y,w,h) =faces[0]
face_region = img[y-10:y+h+10, x-10:x+w+10]
    
    # Save the extracted face region
cv2.imwrite("./face_region_final_pakka.jpg", face_region)

# Display the output
#cv2_imshow(img)
cv2.waitKey()
cv2.destroyAllWindows()


#match faces

# Load the two images to be compared
img1 = cv2.imread('./face_region_final_pakka.jpg')
img2 = cv2.imread('./nandini.jpeg')

# Convert the images to RGB
img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)
img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2RGB)

# Detect the faces in both images
face_locations1 = face_recognition.face_locations(img1)
face_locations2 = face_recognition.face_locations(img2)

# Extract the 128-D facial embeddings for each face
encodings1 = face_recognition.face_encodings(img1, face_locations1)
encodings2 = face_recognition.face_encodings(img2, face_locations2)

# Compare the facial embeddings to see if they match
match = False
for encoding1 in encodings1:
    for encoding2 in encodings2:
        result = face_recognition.compare_faces([encoding1], encoding2, tolerance=0.5)
        if result[0]:
            match = True
            break

if match:
    print("The faces match.")
else:
    print("The faces do not match.")
