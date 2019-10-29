# Image Tutorial

Welcome to the Image-Tutorial. This tutorial explains how to implement and use images in slidenotes.io. 

To begin the presentation press ctrl+Escape or the play button
---
# Images in Slidenotes - the Image-Tag

Using images in Presentations is quite common nowadays. Although Slidenotes are not meant to be heavily image based (sincerely there are better aproaches to that kind of presentations) it is of course possible and easy to use images in Slidenotes. 

Images are represented in the Slidenote-code with the Image-Tag you know from Markdown: 

+++code
![Imagedescription / Alt-Text](Imagename)
+++

The Text inside the square brackets "[]" will be interpreted as the Imagedescription or Alt-Text, which will be displayed on devices where its not possible to show the actual image itself - such as Screenreaders or Terminal-Browsers. 

The Imagename in the brackets "()" is the name of the image you want to use. This can, but is not necessary the same as the filename of the image you choose to use. In fact, it is up to you how you call your image. We will come back to that later. For now, lets continue with how we can implement your imagefiles to have something to work with:
---
# Attaching an imagefile to a Slidenote

While in the Code all images are represented by image-tags, the actual image-file must be attached to the Slidenote-Document. In the Process of attaching the image to the Slidenote it will have the same encription as you are used to, making handling images in Slidenotes a secure and easy to use method to share documents even with images inside. 

All attached image-files to a Slidenote are stored together with the Slidenote. In the image gallery you can get an Overview over the image-files attached to the Slidenote-Document and if or where in the document it is used. 

To attach a image-file to a document you have not one, but two ways:
 
+++layout:inline
## The Image-Selection-Dialog
1. Whenever you write a new image-tag inside the note with an image-name not yet used, the selection Dialog of the image-gallery will open up. There you can "add image" to the image-gallery to attach a new image-file to the image-gallery and use it directly in the new image-tag
2. Inserting an image-tag via the Toolbar-Buttons also opens the Image-Selection-Dialog from the Image-Gallery. You can either choose a yet attached Image or attach a new Image-File to the Image-Gallery
3. Open the Image-Selection-Dialog via the Context-Menu while the Cursor is inside the image-tag you want to apply the image-file to

## The Image-Gallery 
Opening the Image-Gallery and attach a new Image-File there. In Contrast to the attaching via Image-Selection-Dialog, this only attaches the image-file to the Image-Gallery - without using it yet. The newly attached image-file can later on be selected by connecting it to a imagename via the Image-Selection-Dialog. 

+++



---
# Imagenames and Image-Gallery

As Slidenotes is a solely text-based aproach to write presentations, images can not directly be displayed and used inside the code of the presentation - as it is not text and cannot be altered as such. Therefore we have the concept of the image-tags in the code to define where and how an image should be used and the Image-Gallery as the Container, where all the actual image-files are stored. 

To connect both, we make use of the image-names. This makes it convenient to re-use images in the document and replace them in one go if you decide to do so. You could for example use the tag `![](my example image)` on several diferent slides in the document. If you changed your mind later on, you can replace the image the name uses by opening the image-selection Dialog and selecting (or uploading) another image. To open up the image-selection Dialog for an image-tag you can simply go with your cursor inside the image-tag you want to alter and click either in the Toolbar on the button for image or open up the Context-menu and press the button for image-selection there. 

---
![](background)
# Images as Background

Images will be displayed as background-images of a slide or layout-block, whenever they are declared in the first line of the slide or block:

+++code
---
![](first background)

# my first slide with backgroundimage

---
![](second background)

# this slide has another backgroundimage

---
![](first background)

# this slide uses the same image as background as the first slide 

---
# Slide with a layoutblock filled with background:

 +++layout:left
![](background-left)

Some Text on the left side of the Slide above the background-image named "background-left"
 +++

The Text used on the right side of the Slide, as following the layout-declaration

+++

---
![](first background)

# Time to Play

Change the Background-Image of this Slide and the following Slides. [If you want to skip this part click here](#slide10)

---
![](second background)

# this slide has another backgroundimage

As you can see it has yet no image-file connected to its tag. Therefore its displayed in Red inside the Editor. 

---
![](first background)

# this slide uses the same image as background as the first slide 

If you change the imagefile connected with the name "first background" via the Image-Selection-Dialog it will have effect here and everywhere the same name is used in imagetags. 

---
# Slide with a layoutblock filled with background:

+++layout:left
![](background-left)

Some Text on the left side of the Slide above the background-image named "background-left"
+++

The Text used on the right side of the Slide, as following the layout-declaration
---
# Positioning the images

With the Background-Image-Definition you have mastered the first of the declarations how you can position the images inside the presentation: 
The Slidenote-Editor makes use of how you position the image-tag inside your Code. We use this concept to make it as easy to use as possible, without ever touching your mouse or defining complicated syntax-driven positioning of the image. You just write it down and the Slidenoteeditor will take care of all the rest. 
Therefore we have some simple and logical ways of how you can define the positioning of images:

##Definitions of Image-Positioning
1. Images inside the line of a title are positioned inside the title - on the left if they are the first element, on the right if they are the last element. They will be displayed in the height of the corresponding title, keeping its aspect-ratio. You can use this for example for a logo inside the title of a Slidenote. 
2. Images at the begining of a block of text will be interpreted as that they are on the left side, the following text will float around the image. 
3. Images at the end of a block of text will be interpreted as that they are on the right side of the textblock and the text will float around the image
4. Images inside a textblock will be displayed as icons inside the text, calculated by the height of the line of text.  
5. Images, which are the sole content of the slide, but not in the first line of the slide, will be displayed as big as possible, centered on the slide

---
# Imagedescriptions and Image-subtitles

Images can have descriptions or Alt-Text, which will be displayed whenever or wherever the browser dont want to display the image. The most known example is a screenreader, which reads this text to the user instead of displaying an image. But also some other browsers, for example in phones, have disabled images by default. Giving your image an Alt-Text is a good way to keep your content more accessible and is highly recommended. The Alt-Text is **not bound to the image-name**. You can use different Alt-Texts in several Image-Tags if you want to. 

Also you can give your Images some Subtitles: 
If a image-tag is the sole element of a line and in the following line comes a line with text, the text is used as Subtitle and will be displayed directly under the image: 
+++layout:inline

![image of a dog](example)
This is Lapa, a friendly dog

+++code
---
# a slide to demonstrate images with subtitles

![an example image](example)
subtitle to the image

some more text, following, disconnected with the image
+++

+++

---
# Quality of Images

As all images are directly attached to the document, the size of the image-files used in the document reflect directly the size of the document in general. As they are encripted, the size even blows higher than what is used in your filesystem directly. 
Therefore it is good practice to think about the quality you use when attaching a image-file to the Slidenote by loading it in the Image-Gallery. 

The best ratio between quality and image can be reached by resizing your image with an image-editing application like Gimp or Photoshop. But this can be rather bothersome and most of all time consuming. We therefore builded inside the posibility to choose the quality in the process of adding the image to the image-gallery. You can choose between three different options (small, medium and large) and the Slidenoteeditor will take care of resizing the image to the desired quality. Keep in mind that in this process the image will be changed to a .png-image. If you want to add a .gif-animation the animation would not be used at all. 
Therefore - or if you have used another Image-Manipulation-Application for resizing your image to the desired size - you should use the option "original". 

---
# Thats it

Congratulations. You have mastered the use of images in Slidenotes. Wasn't that hard, was it? 
Feel free to experiment more inside the tutorial or [go back to the editor](/editor) and work within your slidenote

Something still bothering you? 
Please write us your feedback so we can improve the tutorials and the Slidenoteeditor for you.

