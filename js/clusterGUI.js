/**
 * @author Scott Garner / http://scott.j38.net/
 */

"use strict";

var clusterGUI = {

	localMediaStream: null,

	init: function() {

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia;

	},

	clearCanvases: function() {

		var canvas;

		canvas = $('#dropBox')[0];
		canvas.getContext('2d').clearRect ( 0 , 0 , canvas.width, canvas.height );

		canvas = $('#kmeans')[0];
		canvas.getContext('2d').clearRect ( 0 , 0 , canvas.width, canvas.height );

	},

	drawKMeans: function() {

		// Prepare canvas

		console.log('Prepare canvas');

		var context = $('#dropBox')[0].getContext('2d');
		var imageData = context.getImageData(0, 0, 400, 200);
		var data = imageData.data;

		// Pixel Array

		console.log('Canvas to pixel array');

		var clusterCount = 12;
		var pixelArray = [];

		for(var i = 0; i < data.length; i += 4) {
			pixelArray.push([data[i], data[i+1], data[i+2]]);
		}

		// Pick Centroids

		console.log('Prepare Centroids');

		var centroids = [];
		for (var i = 0; i < clusterCount; i++)
			centroids[i] = pixelArray[i * Math.floor(pixelArray.length / clusterCount)];

		// KMeans

		console.log('Kmeans');

		clusterEvents.worker.postMessage({
			'arrayToProcess': pixelArray,
			'centroids':centroids, 
			'clusters':clusterCount
		});

	},

	drawGroups: function(workerData) {

		var groups = workerData.groups;
		var centroids = workerData.centroids;
		
		var context = $('#kmeans')[0].getContext('2d');	
		var imageData = context.getImageData(0, 0, 400, 200);
		var data = imageData.data;

		var k = 0;
		for (var i = 0; i < groups.length; i++) {
			var currentGroup = groups[i];

			for (var j = 0; j < currentGroup.length; j++) {
				var currentPixel = currentGroup[j];
				data[k++] = currentPixel[0];
				data[k++] = currentPixel[1];
				data[k++] = currentPixel[2];
				data[k++] = 255;

			}
		}

		// Draw to Canvas

		context.putImageData(imageData, 0,0);

		// Add to 3D Scene

		clusterScene.drawClusters(centroids,groups);

	},

	showVideoChooser: function() {

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

		navigator.getUserMedia({video: true},
			function(stream) {
				clusterGUI.localMediaStream = stream;
				$("#webcam")[0].src = window.URL.createObjectURL(stream);

				$("#webcam").show();
			},
			function(e) { console.log('Error!', e); });
	},

	takeVideoSnapshot: function() {

		// http://www.html5rocks.com/en/tutorials/getusermedia/intro/

		if (clusterGUI.localMediaStream != null) {

			var context = $('#dropBox')[0].getContext('2d');
			context.drawImage($("#webcam")[0], 0, 0, 400, 200);
			
			$("#webcam").hide();
			
			clusterGUI.drawKMeans();
			clusterGUI.localMediaStream.stop();
		}
	}
}