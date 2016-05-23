/* global Function */

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
	var sI,sT,rV,d,bA,bX=[],bY=[],bXnew,bYnew,cA = [],pO = this,i=0;
	var	aA = this.coords.slice();
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
			bA = aA.slice();
			bXnew = bX.slice();
			bYnew = bY.slice();
			while(bXnew.length>1){
				for(var y=0;y<bXnew.length-1;y++){
					cA.push(((bXnew[y+1]-bXnew[y])*d)+bXnew[y]);
				}
				bXnew = cA.slice();
				cA = [];
			}
			
			
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




