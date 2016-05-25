/* global easingModes */

bProps = {
	coords: [],
	output: [],
	time: null,
	dur: null
};

canvasProps = {
	coords: [],
	movableCoords: []
};

firingOnce = {
	canvaOnMouseMove: false,
	pointOnClick: false,
	pointOnRelease: false,
	pointToMove:null,
	movingState:false,
	isCursorOnPoint:null,
	easingIncr:0
};

defaultValues = {
	dur: 0,
	samp1: 0,
	samp2: 1,
	samp3: 0,
	samp4: 0,
	samp5: 40,
	samp6: 0
};

var newSetTimeout;
function cC(action,obj){
	var newValue = action===0? "Array copied to clipboard":"Copy to clipboard";
	var out = document.getElementById("outputStatus");
	
	if(action===0){
		obj.select();
		var state = document.execCommand('copy');
		newValue = state ? newValue:'Unable to copy! Copy array manually.';
	}
	
	if(action===2){
		var selection = window.getSelection();
		selection.removeAllRanges();		
	}

	if(action!==2){
		out.innerHTML = newValue;
		out.style.color = "rgba(255,255,255,.7)";
	}
	
	if(action!==1){
		clearTimeout(newSetTimeout);
		newSetTimeout = setTimeout(function(){
			out.style.color = "rgba(255,255,255,0)";
		},1000);
	}
}

function setEasingOptions(){	//Create Select TAG with all coords properties
	var elem = document.getElementById("easingMode");
	var getProperty = Object.getOwnPropertyNames(easingModes);
		getProperty.push("custom");
	for(var i=0;i<getProperty.length;i++){
		var newOption = document.createElement("OPTION");
		var newText = document.createTextNode(getProperty[i]);
		newOption.appendChild(newText);
		elem.appendChild(newOption);
	}
}

function setPointsOptions(num){
	var elem = document.getElementById("numOfPoints");
	for(var i=0;i<num;i++){
		var newEl = document.createElement("OPTION");
		var newVal = document.createTextNode(i+1);
		newEl.appendChild(newVal);
		elem.appendChild(newEl);
	}
}

function setListeners(state){
	var dR = document.getElementById("durationValue");
	var pS = document.getElementById("numOfPoints");
	var rB = document.getElementById("resetSample");
	var sB = document.getElementById("easeSample");
	var cD = document.getElementById("switchXY");
	var mS = document.getElementById("easingMode");
	
	if(state){
		sB.addEventListener("click",easeSamples);
		rB.addEventListener("click",resetSamples);
		cD.addEventListener("click",switchMe);
		dR.addEventListener("input",setDur);
		pS.addEventListener("change",addPoints);
		mS.addEventListener("change",setModeCoords);
		dR.removeAttribute("readonly");
		pS.removeAttribute("disabled");
		mS.removeAttribute("disabled");
		} else {
			rB.removeEventListener("click",resetSamples);
			sB.removeEventListener("click",easeSamples);
			cD.removeEventListener("click",switchMe);
			dR.setAttribute("readonly","readonly");
			pS.setAttribute("disabled","disabled");
			mS.setAttribute("disabled","disabled");
			}
}


function setModeCoords(){	//Push selected coords into bProps Object to further usage
	var sel = document.getElementById("easingMode");
	var modeList = Object.getOwnPropertyNames(easingModes);
	var checked = modeList[sel.selectedIndex];
	var pos = easingModes[checked];
	if(typeof checked !== "undefined"){
		bProps.coords = [];
		for(var i=0;i<pos.length;i++){
			bProps.coords.push(pos[i]);	//push y
		}
	drawBezier(bProps.coords,bProps.dur,0,2);
	setNewPoint();
	createEasingObjects();
	}
}

function adjustXcoords(){
	for(var i=0,y=1;i<bProps.coords.length;i+=2,y++){
		bProps.coords.splice(i,1,(1/(bProps.coords.length/2))*y);
	}
	drawBezier(bProps.coords,bProps.dur,0,2);
	setNewPoint();
	createEasingObjects();
}

function setNewPoint(){
	var sel = document.getElementById("numOfPoints");
	sel.selectedIndex = ((bProps.coords.length-1)/2)-1;
}

function addPoints(){
	var sel = document.getElementById("numOfPoints");
	var easingMode = document.getElementById("easingMode");
	var newVal = sel.options[sel.selectedIndex].innerHTML;
	var newPoints = newVal-((bProps.coords.length/2)-1);
	
	if(newPoints<0){
		bProps.coords.splice(bProps.coords.length-2+newPoints*2,-newPoints*2);
	} else if(newPoints>0){
		var cL = bProps.coords.length;
		
		var lastX = bProps.coords[cL-4];
		var lastY = bProps.coords[cL-3];
		var stepX = (1-lastX)/(newPoints+1);
		var stepY = (bProps.coords[cL-1]-lastY)/(newPoints+1);
		for(var i=0;i<newPoints;i++){
			var newX = parseFloat((lastX+(stepX*(i+1))).toFixed(2));
			var newY = parseFloat((lastY+(stepY*(i+1))).toFixed(2));
			bProps.coords.splice(bProps.coords.length-2,0,newX,newY);
		}
	}
		switchMe(event,true);
		easingMode.selectedIndex = easingMode.options.length-1;
		drawBezier(bProps.coords,bProps.dur,0,2);
		createEasingObjects();
}


function setTime(){
	var timeR = document.getElementById("timeRange");
	var timeO = timeR.nextSibling;
	bProps.time = timeR.value;
	timeO.value = timeR.value + "s";
	createEasingObjects();
}

function setDur(){
	var durR = document.getElementById("durationValue");
	var durO = durR.nextSibling;
	bProps.dur = durR.value;
	durO.value = durR.value;
	drawBezier(bProps.coords,bProps.dur,0,1);
}

function switchMe(event,toSwitch){
	
	var obj = document.getElementById("switchXY");
	var cA = obj.getAttribute("class");
		if((!toSwitch&&cA==="switchY")||(toSwitch&&cA==="switchX")){
			adjustXcoords();
			
		}
		if(!toSwitch){
			var nA = cA==="switchY" ? "switchX":"switchY";
			obj.setAttribute("class", nA);
		}
}

function resetSamples(){
	document.getElementById("durationValue").value = defaultValues.dur;
	setDur();
	var sampObj = Object.getOwnPropertyNames(changeMe);
	for(var i=0;i<sampObj.length;i++){
		changeMe["samp"+(i+1)](defaultValues["samp"+(i+1)]);
	}
}

var changeMe = {
	samp1:function(a){
		var samp1 = document.getElementById("samp1");
		samp1.style.left = a+"px";
	},
	samp2:function(a){
		var samp2 = document.getElementById("samp2");
		samp2.style.opacity = a;
	},
	samp3:function(a){
		var samp3 = document.getElementById("samp3");
		samp3.style.letterSpacing = a+"px";
	},
	samp4:function(a){
		var samp4 = document.getElementById("samp4");
		samp4.style.color = "rgb("+Math.round(255-(255*.6*a))+","+Math.round(255-(255*.3*a))+","+Math.round(255-(255*.1*a))+")";
	},
	samp5:function(a){
		var samp5 = document.getElementById("samp5");
		samp5.style.height = a+"px";
	},
	samp6:function(a){
		var samp6 = document.getElementById("samp6");
		samp6.style.width = (200+100*a) +"px";
		samp6.style.height = (80+80*a)+"px";
		samp6.style.background = "linear-gradient(to top, rgb("+(33+Math.round(18*a))+","+(105+Math.round(33*a))+","+(134+Math.round(29*a))+"), rgb("+(51-Math.round(18*a))+","+(138-Math.round(33*a))+","+(163-Math.round(29*a))+"))";
	}
};

var sampEasing1,sampEasing2,sampEasing3,sampEasing4;
function createEasingObjects(){
	sampEasing1 = new smEasing({
		coords:bProps.output,
		fps:32,
		start:0,
		stop:350,
		time:bProps.time*1000,
		delay:0,
		action:function(a){
			changeMe.samp1(a);
			document.getElementById("durationValue").value = this.duration;
			setDur();
			if(this.duration===1){
				setListeners(true);
			}
		}
	});
	
	sampEasing2 = new smEasing({
		coords:bProps.output,
		fps:32,
		start:1,
		stop:0,
		time:bProps.time*1000,
		delay:0,		
		action:function(a){
			changeMe.samp2(a);
		}});
	
	sampEasing3 = new smEasing({
		coords:bProps.output,
		fps:32,
		start:0,
		stop:20,
		time:bProps.time*1000,
		delay:0,		
		action:function(a){
			changeMe.samp3(a);
		}});
	
	sampEasing4 = new smEasing({
		coords:bProps.output,
		fps:32,
		start:0,
		stop:1,
		time:bProps.time*1000,
		delay:0,
		action:function(a){
			changeMe.samp4(a);
		}});
	
	sampEasing5 = new smEasing({
		coords:bProps.output,
		fps:32,
		start:40,
		stop:200,
		time:bProps.time*1000,
		delay:0,
		action:function(a){
			changeMe.samp5(a);
		}});
	
	sampEasing6 = new smEasing({
		coords:bProps.output,
		fps:32,
		start:0,
		stop:1,
		time:bProps.time*1000,
		delay:0,
		action:function(a){
			changeMe.samp6(a);
		}});
}

function easeSamples(){
	setListeners(false);
	sampEasing1.run();
	sampEasing2.run();
	sampEasing3.run();
	sampEasing4.run();
	sampEasing5.run();
	sampEasing6.run();
}

window.onload = function(){
	createLayers("canvaContainer",12,500,840);
	setListeners(true);
	setEasingOptions();
	setPointsOptions(16);
	setModeCoords();
	drawBezier(bProps.coords,bProps.dur,0,0);
	setTime();
	setDur();
	canvaEvents(0,1);
};

function createLayers(contId,numOfLayers,width,height){
	var container = document.getElementById(contId);
	container.style.position="relative";
	container.style.zIndex="0";
	container.style.width = width + "px";
	container.style.height = height + "px";
	for(var i=0;i<numOfLayers;i++){
		var newCanva = document.createElement("CANVAS");
		newCanva.setAttribute("width",width);
		newCanva.setAttribute("height",height);
		newCanva.setAttribute("class","layer"+(i+1));
		newCanva.style.zIndex=(i+1).toString();
		newCanva.style.position = "absolute";
		newCanva.style.top = "0px";
		newCanva.style.left = "0px";
		
		container.appendChild(newCanva);
	}
}

function canvaEvents(getE,state){		//	0: move		1: click	2: release
	var canva = document.getElementById("canvaContainer");
	
	var fE = ["mousemove","mousedown","mouseup"];
	var fF = [moveMe,clickMe,releaseMe];
	var whichEvent = Object.getOwnPropertyNames(firingOnce)[getE];
	var getState = Number(firingOnce[whichEvent]);
	var eventObj = getE===2 ? document.body:canva;
	if(getState===state){
		return;
	}
	
	if(state===1){
		firingOnce[whichEvent] = true;	
		eventObj.addEventListener(fE[getE],fF[getE]);
	} else if(state===0){
		firingOnce[whichEvent] = false;
		eventObj.removeEventListener(fE[getE],fF[getE]);
	}	
}

function moveMe(){
	if(!firingOnce.movingState){
		firingOnce.pointToMove = null;
	}
	
	var canva = document.getElementById("canvaContainer");
	var layer = canva.children;	
	
	var sel = document.getElementById("easingMode");
	
	var margin = 20;
	var cX = (event.clientX+document.body.scrollLeft)-canva.offsetLeft;
	var cY = (event.clientY+document.body.scrollTop)-canva.offsetTop;
	var pA = layer[0].getContext("2d");
		pA.lineWidth = 10;
		for(var i=0;i<canvasProps.movableCoords.length/2;i++){
			pA.beginPath();
			pA.arc(canvasProps.movableCoords[i*2],canvasProps.movableCoords[i*2+1],15,0,2*Math.PI);
			if (pA.isPointInPath(cX,cY)&&firingOnce.pointToMove===null){
				firingOnce.pointToMove = i;
			} 
		}

	if(firingOnce.pointToMove!==null){
		document.body.style.cursor="pointer";
		overPoint(1);
		canvaEvents(1,1);
		canvaEvents(2,1);
		}else{
			document.body.style.cursor="auto";
			overPoint(-1);
			canvaEvents(1,0);
			canvaEvents(2,0);					
			}

	if(firingOnce.movingState&&firingOnce.pointToMove!==null){
		cX = cX<margin ? margin:cX>layer[0].width-margin?layer[0].width-margin:cX;
		cY = cY<margin ? margin:cY>layer[0].height-margin?layer[0].height-margin:cY;
		var newCoords = canvasProps.coords.slice();
			if((newCoords.length)/2-1===firingOnce.pointToMove){
				newCoords.splice(firingOnce.pointToMove*2+1,1,cY);
				} else {
					var obj = document.getElementById("switchXY");
					var cA = obj.getAttribute("class");
					if(cA==="switchY"){
						newCoords.splice(firingOnce.pointToMove*2,2,cX,cY);
						} else {
							newCoords.splice(firingOnce.pointToMove*2+1,1,cY);
							}
					}
		drawBezier(newCoords,bProps.dur,1,2);
		createEasingObjects();
	}
	
	if(firingOnce.movingState&&sel.selectedIndex+1!==sel.options.length){
		sel.selectedIndex = sel.options.length-1;
	}
}

function clickMe(){
	firingOnce.movingState = true;
}

function releaseMe(){
	firingOnce.movingState = false;
	document.body.style.cursor="auto";
}

function overPoint(pos){
	if(firingOnce.isCursorOnPoint===null){
		firingOnce.isCursorOnPoint=pos;
	}

	if(firingOnce.isCursorOnPoint!==pos&&!(firingOnce.movingState)){
		firingOnce.isCursorOnPoint = pos;
		
		clearInterval(this.easePoints);
		easePoints = setInterval(function(){
		
		if(!firingOnce.movingState){
			drawBezier(bProps.coords,bProps.dur,0,3);
		}
		
		firingOnce.easingIncr+=pos;
		firingOnce.easingIncr = firingOnce.easingIncr<0?0:firingOnce.easingIncr>20?20:firingOnce.easingIncr;
		if(firingOnce.easingIncr===0||firingOnce.easingIncr===20){
			clearInterval(easePoints);
			}
		},10);
	}
}

function drawBezier(gC,dur,whatToCount,drawLayers){
	var container = document.getElementById("canvaContainer");
	var oP = document.getElementById("outputCoords");
	var drawFunctions = [drawCoords,drawEdges,drawProgressY,drawProgressX,drawBoldLines,drawThinLines,drawDurPoints,drawCurveY,drawCurveX,drawPointA,drawPointB,drawInnerPoints,drawEasingPoint];
	var initFunction = [[0,1,2,3,4,5,6,7,8,9,10,11,12],		//initiation
						[2,3,5,6,12],		//changeDur, Start, Reset
						[0,2,4,5,6,7,8,10,11,12],//addPoints, X/XY, ChangeMode, MovePoints
						[10,11]];	//innerPoints,pointB - onMouseOver;
	var cRad = 3;
	var paddingY = 220;
	var margin = 20;
	var coordsText = ["#ffffff","#ffffff","#ffffff"];
	var progress = ["rgba(255,255,255,.05)","rgba(255,255,255,.05)","rgba(255,255,255,.25)"];
	var limitLines = ["rgba(255,255,255,.25)","rgba(255,255,255,.25)","rgba(255,255,255,.5)"];
	var boldLines = ["rgba(255,255,255,.15)","rgba(255,255,255,.25)","transparent"];
	var thinLines = ["rgba(255,255,255,.5)","rgba(255,255,255,.5)","transparent"];
	var boldPoints = ["#9BC5CC","#629DB1","rgba(255,255,255,.9)"];
	var thinPoints = ["#9EC5CB","#9EC5CB","#9EC5CB"];
	var curvePoints = ["#0B2C47","#0B2C47","transparent"];
	var curvePoints2 = ["#FF8800","#FF8800","#transparent"];
	var durationPoint = ["#0B2C47","#71ACB6","#71ACB6"];
	var dBoldPoints,dThinPoints=[],dDurationPoint;
	var nrOfDots = 100;
	var layer = [];
	for(var i=0;i<drawFunctions.length;i++){
		layer.push(container.children[i]);
	}
	var layer1 = layer[0].getContext("2d"),
		layer2 = layer[1].getContext("2d"),
		layer3 = layer[2].getContext("2d"),
		layer4 = layer[3].getContext("2d"),
		layer5 = layer[4].getContext("2d"),
		layer6 = layer[5].getContext("2d"),
		layer7 = layer[6].getContext("2d"),
		layer8 = layer[7].getContext("2d"),
		layer9 = layer[8].getContext("2d"),
		layer10 = layer[9].getContext("2d"),
		layer11 = layer[10].getContext("2d"),
		layer12 = layer[11].getContext("2d");
	
	function edges(inout,xy,side){	//arg1: 0:outOfLimit, 1:limited; arg2: x:0, y:1; arg3 left/top:0, right/bottom:1;
		var isLimited = inout===0 ? 0:xy===0 ? margin:paddingY;
		var r = xy===0 ? [0+isLimited,layer[0].width-isLimited]:[0+isLimited,layer[0].height-isLimited];
		return r[side];
	}	

	function coordsToPixels(){
		var tPx = function(crdX){return margin+((layer[0].width-(margin*2))*crdX);};
		var tPy = function(crdY){return layer[0].height-paddingY-((layer[0].height-(paddingY*2))*crdY);};
		var tNx = function(bzX){return (bzX-margin)/(layer[0].width-(margin*2));};
		var tNy = function(bzY){return 1-((bzY-paddingY)/(layer[0].height-(paddingY*2)));};
		
		var nFx = whatToCount ? tNx:tPx;
		var nFy = whatToCount ? tNy:tPy;
		var keep = [];
		var change = [];
		for(var i=0;i<gC.length;i++){
			var isOdd = i/2 === Math.round(i/2)? nFx(gC[i]):nFy(gC[i]);
			keep[i] = gC[i];
			change[i] = isOdd;
		}
		canvasProps.coords = whatToCount ? keep:change;
		bProps.coords = whatToCount ? change:keep;
	}
	
	function algorithm(setDuration){
		var innerDur = typeof setDuration === "undefined"? dur:setDuration;
		var	aA = canvasProps.coords.slice();
		var bA,cA=[];
		var dA=[];
		var countMe = 0;
		var bX=[];
		canvasProps.movableCoords = aA.slice();
		aA.unshift(edges(1,0,0),edges(1,1,1));
		dBoldPoints = aA.slice();
		bA = aA.slice();
		dA = bProps.coords.slice();
		dA.unshift(0,0);
		for(var z=0;z<dA.length;z+=2){
			bX.push(dA[z]);
		}	
		bXnew = bX.slice();
		while(bXnew.length>1){
			for(var y=0;y<bXnew.length-1;y++){
				cA.push(((bXnew[y+1]-bXnew[y])*innerDur)+bXnew[y]);
			}
			bXnew = cA.slice();
			cA = [];
		}		
		
		
		while(bA.length>2){
					for(var y=0;y<bA.length-2;y++){
						cA.push(((bA[y+2]-bA[y])*(bXnew))+bA[y]);
					}
					bA = cA.slice();
					cA = [];
					
					countMe++;
					if(bA.length===2){
						
						dDurationPoint = bA.slice();
					} else {
						dThinPoints.push(bA);
					}
				}
		return dDurationPoint;
	}
	
	coordsToPixels();
	algorithm();
	
	for(var i=0;i<initFunction[drawLayers].length;i++){
		drawFunctions[initFunction[drawLayers][i]]();
	}

	function drawSth(obj,iter,lW,sS,fS,sB,sX,sY,sC,tD){
		for(var ct=0;ct<iter;ct++){
		obj.lineWidth=lW;
		obj.strokeStyle=sS;
		obj.fillStyle=fS;
		obj.shadowBlur=sB;
		obj.shadowOffsetX=sX;
		obj.shadowOffsetY=sY;
		obj.shadowColor=sC;			
		obj.beginPath();
		tD(ct);
		obj.stroke();
		obj.fill();
		}
	}

	function clear(obj){
		obj.clearRect(edges(0,0,0), edges(0,1,0), edges(0,0,1), edges(0,1,1));
	}
	
	function drawCoords(){
			drawSth(layer1,1,2,coordsText[0],coordsText[1],8,1,3,coordsText[2],function(){
				var n = function(x){return parseFloat(x.toFixed(2));};
				var retS="";
				var retA = [];
				for(var i=0;i<bProps.coords.length;i++){
					retA.push(n(bProps.coords[i]));
				}
				retS = "[ ".concat(retA.join(" , ")," ]");
				oP.value = retS;
				oP.setAttribute("title", retS);
				bProps.output = retA.slice();
			});	
	}

	function drawEdges(){
			clear(layer1);
			drawSth(layer1,2,2,limitLines[0],limitLines[1],5,3,2,limitLines[2],function(ct){
				layer1.moveTo(edges(1,0,0),edges(1,1,ct));
				layer1.lineTo(edges(1,0,1),edges(1,1,ct));
			});
		}
	function drawProgressY(){
			clear(layer2);
			drawSth(layer2,1,2,progress[0],progress[1],0,0,0,progress[2],function(ct){
				layer2.fillRect(edges(1,0,0),edges(1,1,1),edges(1,0,1)-edges(1,0,0),-edges(1,1,1)+algorithm()[1]);
			});
		}
	function drawProgressX(){
			clear(layer3);
			drawSth(layer3,1,2,progress[0],progress[1],0,0,0,progress[2],function(){
				layer3.fillRect(edges(1,0,0),edges(1,1,0),(edges(1,0,1)-edges(1,0,0))*dur,edges(1,1,1)-edges(1,1,0));
			});
		}
	function drawBoldLines(){
			clear(layer4);
			drawSth(layer4,dBoldPoints.length/2-1,8,boldLines[0],boldLines[1],0,0,0,boldLines[2],function(ct){	//point lines
				layer4.moveTo(dBoldPoints[ct*2],dBoldPoints[ct*2+1]);
				layer4.lineTo(dBoldPoints[ct*2+2],dBoldPoints[ct*2+3]);
			});	
		}
	function drawThinLines(){
			clear(layer5);
			drawSth(layer5,dThinPoints.length,2,thinLines[0],thinLines[1],0,0,0,thinLines[2],function(ct){	//duration lines
				var passed = dThinPoints[ct];
				drawSth(layer5,passed.length/2-1,2,thinLines[0],thinLines[1],0,0,0,thinLines[2],function(ct){	//duration lines
					layer5.moveTo(passed[ct*2],passed[ct*2+1]);
					layer5.lineTo(passed[ct*2+2],passed[ct*2+3]);
				});	
			});			
		}
	function drawDurPoints(){
			clear(layer6);
			drawSth(layer6,dThinPoints.length,1,thinPoints[0],thinPoints[1],0,0,0,thinPoints[2],function(ct){	//durationA points
				var passed = dThinPoints[ct];
				drawSth(layer6,passed.length/2,1,thinPoints[0],thinPoints[1],0,0,0,thinPoints[2],function(ct){		//durationB points
					layer6.arc(passed[ct*2],passed[ct*2+1],cRad,0,2*Math.PI);
				});				
			});	
		}
	function drawCurveY(){
			clear(layer7);
			drawSth(layer7,nrOfDots,1,curvePoints[0],curvePoints[1],0,0,0,curvePoints[2],function(ct){		//draw Curve
				var nDur=ct/nrOfDots;
				
				layer7.arc(algorithm(nDur)[0],algorithm(nDur)[1],1,0,2*Math.PI);
			});		
		}
	function drawCurveX(){
			clear(layer8);
			drawSth(layer8,nrOfDots,1,curvePoints2[0],curvePoints2[1],0,0,0,curvePoints2[2],function(ct){		//draw Curve
				var nDur=ct/nrOfDots;
				var nowy = (edges(1,0,1)-edges(1,0,0))*nDur+edges(1,0,0);
				layer8.arc(nowy,algorithm(nDur)[1],1,0,2*Math.PI);
			});		
		}
	function drawPointA(){
			clear(layer9);
			drawSth(layer9,1,10,boldPoints[0],boldPoints[1],0,0,0,boldPoints[2],function(){	//points A
				layer9.arc(dBoldPoints[0],dBoldPoints[1],cRad,0,2*Math.PI);
			});				
		}
	function drawPointB(){
			clear(layer10);
			drawSth(layer10,dBoldPoints.length/2-2,10,boldPoints[0],boldPoints[1],firingOnce.easingIncr,0,0,boldPoints[2],function(ct){	//points A,B,...
				layer10.arc(dBoldPoints[ct*2+2],dBoldPoints[ct*2+3],cRad,0,2*Math.PI);
			});
		}
	function drawInnerPoints(){
			clear(layer11);
			drawSth(layer11,1,10,boldPoints[0],boldPoints[1],firingOnce.easingIncr,0,0,boldPoints[2],function(){	//points BaseB
				layer11.arc(dBoldPoints[dBoldPoints.length-2],dBoldPoints[dBoldPoints.length-1],cRad,0,2*Math.PI);
			});	
		}
	function drawEasingPoint(){
			clear(layer12);
			drawSth(layer12,1,10,durationPoint[0],durationPoint[1],10,0,0,durationPoint[2],function(){	//durationC point
				layer12.arc(algorithm()[0],algorithm()[1],cRad,0,2*Math.PI);
			});				
		}
}