/* global Function, easingModes */

function smEasing(o){
	this.coords = o.coords;
	this.fps = o.fps;
	this.start = o.start;
	this.stop = o.stop;
	this.action = o.action;
	this.time = o.time;
	this.after = o.after;
	this.delay = o.delay;
	this.iteration = 0;
	this.duration = 0;
	this.queue = false;
}

smEasing.prototype.run = function(){
	if(this.queue){
		return;
		} else {
			this.queue = true;
			}
	var pO = this,i=0;
	var sI,sT;
	var rV,aA;
	var d,bX=[],bY=[],bXnew,bYnew,cA = [];
	
	if(validateMe.isArray(this.coords)){
		aA = this.coords.slice();
	} else if(validateMe.isString(this.coords)){
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
	sT = setTimeout(function(){
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
			
			
			rV = pO.start+((pO.stop-pO.start)*bYnew[0]);

			pO.action(rV);
			
			if(i>=hR){
				clearInterval(sI);
				pO.queue = false;
				pO.iteration = 0;
				if(typeof pO.after !== "undefined"){

					var rP = ["coords","fps","start","stop","action","time","delay"];
					for(var x=0;x<rP.length;x++){
						pO.after[rP[x]] = (typeof pO.after[rP[x]])==="undefined"? pO[rP[x]]:pO.after[rP[x]];
					}
					var s = new smEasing(pO.after);
					s.run();
				}
			}
		},nT);
	},pO.delay);
};


validateMe = {
	isArray: function(obj){
		return obj.constructor.toString().indexOf("Array") !== -1;
	},
	isString: function(obj){
		return (typeof obj) === "string";
	}
};

