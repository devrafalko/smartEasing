/* global Function, easingModes */

function smEasing(o,p,b){
	b = validMe.isEmpty(b)? []:b;
	b.push(this);
	
	this.basic = b[0];
	this.coords = passVal(o.coords,p,0);
	this.fps = passVal(o.fps,p,1);
	this.time = passVal(o.time,p,2);
	this.action = passVal(o.action,p,3);
	this.start = o.start;
	this.stop = o.stop;
	this.delay = o.delay;
	this.onStart = o.onStart;
	this.onDelay = o.onDelay;
	this.onStop = o.onStop;
	this.after = o.after;
	this.iteration = 0;
	this.duration = 0;
	this.queue = false;
	this.repetition = validMe.isEmpty(p) ? o.repetition:undefined;
	
	setDefaults.call(this,defVals);
	parseValues.call(this);
	validateValues.call(this);
	
	this.amimations = (!validMe.isEmpty(this.after)) ? new smEasing(this.after,[this.coords,this.fps,this.time,this.action],b):b;
	
	function passVal(p,a,v){
		return validMe.isEmpty(p) ? validMe.isEmpty(a) ? p:a[v]:p;
	}
}

smEasing.prototype.run = function(){
	if(this.queue){
		return;
		} else {
			this.queue = true;
			}
	
	var pO = this,i=0;
	var sI,sT;
	var aA;
	var rV,rA = [];
	var d,bX=[],bY=[],bXnew,bYnew,cA = [];
	if(validMe.isArray(this.coords)){
		aA = this.coords.slice();
	} else if(validMe.isString(this.coords)){
		var cList = Object.getOwnPropertyNames(easingModes);
		for(var y=0;y<cList.length;y++){
			if(this.coords.toLowerCase()===cList[y].toLowerCase()){
				aA = easingModes[cList[y]].slice();
				break;
			} else if(y===cList.length-1){
				aA = easingModes[cList[0]].slice();
			}
		}
	}
		aA.unshift(0,0);
		for(var z=0;z<aA.length;z+=2){
			bX.push(aA[z]);
			bY.push(aA[z+1]);
		}
	var hR = Math.round((this.fps*this.time)/1000);
	var nT = this.time/hR;
	clearInterval(sI);
	this.onStart();
	sT = setTimeout(function(){
		pO.onDelay();
		sI = setInterval(function(){
			i++;
			pO.iteration = i;
			pO.duration = parseFloat(((1/(Math.round((pO.fps*pO.time)/1000)))*pO.iteration).toFixed(2));
			d = (1/hR)*i;
			
			bXnew = bX.slice();
			while(bXnew.length>1){
				for(var y=0;y<bXnew.length-1;y++){
					cA.push(((bXnew[y+1]-bXnew[y])*d)+bXnew[y]);
				}
				bXnew = cA.slice();
				cA = [];
			}
			bYnew = bY.slice();
			while(bYnew.length>1){
				for(var y=0;y<bYnew.length-1;y++){
					cA.push(((bYnew[y+1]-bYnew[y])*bXnew[0])+bYnew[y]);
				}
				bYnew = cA.slice();
				cA = [];
			}
			
			if(validMe.isArray(pO.start)){
				rA = [];
				for (var xy=0;xy<pO.start.length;xy++){
					rA.push(pO.start[xy]+((pO.stop[xy]-pO.start[xy])*bYnew[0]));
				}
				pO.action(rA);
			} else {
				rV = pO.start+((pO.stop-pO.start)*bYnew[0]);
				pO.action(rV);
			}
			
			if(i>=hR){
				clearInterval(sI);
				pO.iteration = 0;
				pO.onStop();
				if(!validMe.isArray(pO.amimations)){
					pO.amimations.run();
				} else {
					for(var xx=0;xx<pO.amimations.length;xx++){
						pO.amimations[xx].queue = false;
					}
					
					pO.basic.repetition -= 1;
					if(pO.basic.repetition!==0){
						pO.basic.run();
					};
				}
			}
		},nT);
	},pO.delay);
};

function setDefaults(def){
	var tC = Object.getOwnPropertyNames(def);
	for(var i=0;i<tC.length;i++){
		this[tC[i]] = validMe.isEmpty(this[tC[i]]) ? def[tC[i]]:this[tC[i]];
	}
}

function parseValues(){
	this.coords = validMe.isArray(this.coords) ? parseMe.itemsToNumbers(this.coords).slice():this.coords;
	this.start = validMe.isArray(this.start)? parseMe.itemsToNumbers(this.start):validMe.isNumber(this.start) ? parseMe.parseToNumber(this.start):this.start;
	this.stop = validMe.isArray(this.stop)? parseMe.itemsToNumbers(this.stop):validMe.isNumber(this.stop) ? parseMe.parseToNumber(this.stop):this.stop;
	this.fps = parseMe.parseToInteger(this.fps);
	this.time = parseMe.parseToInteger(this.time);
	this.time = validMe.isNumber(this.time)&&this.time<=0 ? 1:this.time;
	this.delay = parseMe.parseToInteger(this.delay);
	this.delay = validMe.isNumber(this.delay)&&this.delay<=0 ? 0:this.delay;
	this.repetition = parseMe.parseToInteger(this.repetition);
	this.repetition = (validMe.isNumber(this.repetition)||this.repetition===Number.NEGATIVE_INFINITY)&&this.repetition<=0 ? 1:this.repetition;
}

function validateValues(){
	var objName = this.constructor.name;
	var c = this.coords;
	var f = this.fps;
	var st = this.start;
	var sp = this.stop;
	var t = this.time;
	var d = this.delay;
	var oSt = this.onStart;
	var oD = this.onDelay;
	var oSp = this.onStop;
	var ac = this.action;
	var af = this.after;
	var r = this.repetition;
	
			try{
				if(!(validMe.isArray(c)||validMe.isString(c))) throw "Error: " + "The coords value for " + objName + " object must be of type String or Array.";
				if((validMe.isArray(c))&&(c.length<4)) throw "Error: " + "The coordinates array for " + objName + " object must containt at least 4 values.";
				if((validMe.isArray(c))&&(!validMe.areItemsNums(c))) throw "Error: " + "Every item of coordinates array for " + objName + " object must be a number.";
				if((validMe.isArray(c))&&(!validMe.isNumEven(c.length))) throw "Error: " + "The coordinates array for " + objName + " object must containt even number of coords.";
				if((validMe.isArray(c))&&(c[c.length-2]!==1)) throw "Error: " + "The last but one item of coordinates array for " + objName + " object must be of value 1";
				if((validMe.isString(c))&&(!validMe.isAnyItem(Object.getOwnPropertyNames(easingModes),c))) throw "Error: " + "The coords value '" + c + "' set for " + objName + " object is not on the list of easing modes.";
				if(!validMe.isNumber(f)) throw "Error: " + "The fps value for " + objName + " object must be an Integer."; 
				if(f<1) throw "Error: " + "The fps value for " + objName + " object must be higher than 0"; 
				if(f>75) throw "Error: " + "The fps value for " + objName + " object can be at most 75."; 
				if(!(validMe.isNumber(st)||(validMe.isArray(st)&&st.length>0))) throw "Error: " + "The start value for " + objName + " object must be a number or array with at least one value."; 
				if((validMe.isArray(st))&&(!validMe.areItemsNums(st))) throw "Error: " + "Every item of start array for " + objName + " object must be a number.";
				if(!(validMe.isNumber(sp)||(validMe.isArray(sp)&&sp.length>0))) throw "Error: " + "The stop value for " + objName + " object must be a number or array with at least one value."; 
				if((validMe.isNumber(sp)&&validMe.isArray(st))||(validMe.isNumber(st)&&validMe.isArray(sp))) throw "Error: " + "Both start and stop value for " + objName + " object must be of the same type."; 
				if(validMe.isArray(st)&&validMe.isArray(sp)&&st.length!==sp.length) throw "Error: " + "Both start and stop value for " + objName + " object must containt equal number of values."; 
				if((validMe.isArray(sp))&&(!validMe.areItemsNums(sp))) throw "Error: " + "Every item of stop array for " + objName + " object must be a number.";
				if(st===sp) throw "Error: " + "The stop value for " + objName + " object must differ from start value.";
				if(!validMe.isNumber(t)) throw "Error: " + "The time value for " + objName + " object must be an integer."; 
				if(!validMe.isNumber(d)) throw "Error: " + "The delay value for " + objName + " object must be an integer."; 
				if((!validMe.isNumber(r))&&(!validMe.isEmpty(r))&&(r!==Infinity)) throw "Error: " + "The repetition value for " + objName + " object must be an integer or Infinity."; 
				if(!(validMe.isFunction(oSt))) throw "Error: " + "The onStart property for " + objName + " object must be of type Function."; 
				if(!(validMe.isFunction(oD))) throw "Error: " + "The onDelay property for " + objName + " object must be of type Function."; 
				if(!(validMe.isFunction(oSp))) throw "Error: " + "The onStop property for " + objName + " object must be of type Function."; 
				if(!validMe.isFunction(ac)) throw "Error: " + "The action property for " + objName + " object must be of type Function."; 
				if(!(validMe.isObject(af)||validMe.isEmpty(af))) throw "Error: " + "The action property for " + objName + " object must be of type Object."; 

	} catch(err) {throw err;}
};

var defVals = {
	coords:Object.getOwnPropertyNames(easingModes)[0],
	fps:32,
	delay:0,
	action:function(){},
	onStart:function(){},
	onDelay:function(){},
	onStop:function(){}
};

var parseMe = {
	parseToNumber: function(obj){
		return isNaN(parseFloat(obj))?obj:parseFloat(obj);
	},
	itemsToNumbers: function(obj){
		function ch(curr){
			return parseMe.parseToNumber(curr);
		}
		return obj.map(ch);
	},
	parseToInteger: function(obj){
		return (typeof parseMe.parseToNumber(obj))==="number" ? Math.round(parseMe.parseToNumber(obj)):obj;
	}
};

var validMe = {
	isArray: function(obj){
		return validMe.isEmpty(obj) ? false:obj.constructor.toString().indexOf("Array") === -1? false:true;
	},
	isObject: function(obj){
		return validMe.isEmpty(obj) ? false:obj.constructor.toString().indexOf("Object") === -1? false:true;
	},
	isString: function(obj){
		return (typeof obj) === "string";
	},
	isFunction: function(obj){
		return (typeof obj) === "function";
	},
	isNumber: function(obj){
		return ((typeof obj) === "number"&&(!isNaN(obj)))&&(Math.abs(obj)!==Number.POSITIVE_INFINITY);
	},
	isEmpty: function(obj){	//undefined or null
		return (typeof obj) === "undefined"||obj === null;
	},
	isNumEven: function(obj){
		return obj/2===Math.round(obj/2);
	},
	areItemsNums: function(obj){
		function checkItems(curr){
			return validMe.isNumber(curr);
		}
		return obj.every(checkItems);
	},
	isAnyItem: function(obj,item){
		function toLower(c){
			return c.toLowerCase();
		}
		return (obj.map(toLower).indexOf(item.toLowerCase()))===-1 ? false:true;
	}
};


