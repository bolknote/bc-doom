/* http://www.permadi.com/tutorial/raycast/ */
/* https://github.com/parkertomatoes/wolf5k/blob/master/game/wolf5k.html */

d=document;
IsNetscape=!d.all;  //if 0, we're IE, otherwise Netscape.
m=Math;
C=m.PI;
r=m.random;
f=m.floor;
ab=m.abs;
sq=m.sqrt;
si=m.sin;
co=m.cos;
frameDelay=U=fwd=frameNumber=im=gameLevel=playerPoints=Z=playerRotation=numMonsters=playerDead=numKilled=0;  //gameLevel = level number
w=[];
M=_=playerHealth=64;
H=64;
W=128;
playerX=playerY=128;
RAD=Math.PI/180; 	//used to convert angles to radians
playerEyeLevel=32;
INF=1e300;			//infinity
F=30*RAD;			//angle of view (larger distorts the "lens")
R=2*F/128;			//this is the angle of each ray to cover 128 pixels
DistToProjPlane=Math.floor(64/Math.tan(F));	//110 pixels
b2=C/2;				//90 degrees
c3=C;				//180 degrees
c4=C*3/2; 			//270 degrees

zBuffer=CreateArray(128);

//this is used as the default screen
//array.  When rendering, this is stuck
//into the screen array before any additional
//pixels are plotted.
BlankScreen=CreateArray(1152);
for(i=0;i<1152;i++)
{
	if(i>=1024)
		BlankScreen[i]=255;
	else
		BlankScreen[i]=0;
}

b=CreateArray(1152);

//this code generates the hex representation of the values 0-255
//255 => 0xff etc
h="0123456789ABCDEF";
N=[];
for(i=0;i<256;i++)
	N[i]="0x"+h.substr(Math.floor(i/16),1)+h.substr(i%16,1);

//bm is our "Bitmap" of tiles
//just like real BMP files the sprites are upside down
//this serves no actual purpose.  BMP files were stored
//upside down because video memory is "upside down"
//reading the file straight into memory when show to the
//use is then right side up.
bm=[
	[65535,128,448,128,65535,14336,4096,14336,65535,14,4,14,65535,448,128,448], //wall
	[65535,53259,40965,49155,32865,32913,37505,35457,34417,35345,37617,33281,49667,40965,53259,65535], //5K wall tile
	[2040,1224,720,7928,4740,32740,65508,1088,1008,1032,2244,2340,2052,2340,1032,1008], //enemy
	[8184,4104,12680,12680,6120,6120,4488,4488,4104,8184], //health
	[8184,8184,8184,8184,8184,8184,8184,8184,8184,8184], //health mask
	[2040,2040,0x3f0,8184,8188,32764,65532,18424,1008,2040,4092,4092,4092,4092,2040,1008], //enemy mask
	[5136,5136,2592,2592,1088,1984],//gun
	[8176,8176,4064,4064,1984,1984],//gun mask
	[1008,1032,2340,2052,2340,2244,1032,1008], //dead enemy
	[1008,2040,4092,4092,4092,4092,2040,1008],	//dead enemy mask
	[0,0,0,0,0,2080,6096,9544,2336,256] //gunfire
   ];

//FontMap is our "font" encoded in bits
//see the A6, A7 functions for why the bits
//are "backwards."  This is inconsistant with
//the bm array since the bits are not reversed
//just the image is flipped vertically
FontMap=[
	7,5,5,5,7, //0
	1,3,1,1,1, //1
	7,1,7,4,7, //2
	7,1,7,1,7, //3
	5,5,7,1,1, //4
	7,4,7,1,7, //5
	7,4,7,5,7, //6
	7,1,1,1,1, //7
	7,5,7,5,7, //8
	7,5,7,1,1];//9

//creates an array of size a and returns it
function CreateArray(a)
{
	return a?new Array(a):[]
}

//this returns the maps wall value at x,y
//a one indicates we hit a wall
function IsNotValidLocation(x,y)
{
	x=Math.floor(x/64);//we divide by 64 to figure out which tile of the map we are on
	y=Math.floor(y/64);

	//if we are out of bounds return one, otherwise return the value of the wall
	//we are storing the map in bits so we do the &2^x trick to get the bit of the wall
	//array value
	return(x<0||y<0||x>15||y>15)?1:(w[y]&1<<x)
}

//this is the actual raycasting function which renders
//the screen.
function RayCast()
{
	//store the default background in the video memory
	p=[].concat(BlankScreen);

	var c2=-F; //F is the view angle, the larger F is the more we cram into the view area
	var a=playerRotation+c2;  //angle of the ray we are calculating
	var a6=-1;
	var $d;
	var Lht;
	var c1;
	var u;
	var uh=uv=0;
	var a5=INF;
	var a4,a5,$f,d2,dx,dy,$a,$b,$q,$r,$s,$t,$o,$p,ht;

	for($v=0;$v<W;$v++) //what scanline we are working on (0-128)
	{
		c1=$f;
		Lht=ht;
		var c=Math.cos(a);
		var s=Math.sin(a);
		var t=s/c;


		if(!a||a==c3) //if a is 0 or 180 then we get a divide by zero error so we ignore the ray
		{
			a4=INF
		}
		else
		{
			if(s>0) //if we are in the top two quadrants
			{
				$b=Math.floor(playerY/64+1)*64; //start at the tile in front of the player
				dy=64;							//increment in whole tiles forward
				$a=playerX+($b-playerY)/t;		//start with an adjustment to the side of the player
				dx=64/t;						//increment 64/t to the side (plot chart)
			}
			else	//otherwise we are facing backwards so we go in the opposite direction
			{
				$b=Math.floor(playerY/64)*64-.0001;
				dy=-64;
				$a=playerX+($b-playerY)/t;
				dx=-64/t
			}
			//while we have not hit a wall tile or edge of the map
			while(!IsNotValidLocation($a,$b))
			{
				$a+=dx;	//keep shooting the ray
				$b+=dy
			}
			$q=$a;	//store the final location where the ray hits a wall tile
			$r=$b;
			a4=Math.abs((playerX-$a)/c);
			uh=$a%64;	//the pattern repeats every 64 pixels.

			if(s>0)
			uh=64-uh	//flip the pattern
		}
		if(a==b2||a==c4)  //if we are at 90 or 270 degrees our ray has infinite problems
		{
			a5=INF
		}
		else
		{
			if(c>0)
			{
				$a=Math.floor(playerX/64+1)*64;	//start one tile in front of player
				dx=64;
				$b=playerY+($a-playerX)*t;
				dy=64*t
			}
			else
			{
				$a=Math.floor(playerX/64)*64-.0001; //start just behind player
				dx=-64;
				$b=playerY+($a-playerX)*t;		//at 90 and 270, t goes to infinity so multiplying
												//results in an invalid number
				dy=-64*t
			}

			//again look for the first wall tile we hit
			while(!IsNotValidLocation($a,$b))
			{
				$a+=dx;
				$b+=dy
			}

			$s=$a;
			$t=$b;
			a5=Math.abs((playerX-$a)/c);
			uv=$b%64;
			if(c<0)
				uv=64-uv
		}

		$d=a6;
		//we are looking for the smallest distance to travel
		//both rays cannot be infinite at once so we pick the one
		//that is not infinite
		if(a4<a5)
		{
			u=uh; //texture scanline
			$f=a4; //distance from camera
			a6=0;
			$o=$q;	//map x position
			$p=$r;	//map y position
		}
		else
		{
			u=uv;	//text scanline
			$f=a5;	//distance from camera
			a6=1;
			$o=$s;	//map x position
			$p=$t;	//map y position
		}

		$f*=Math.cos(c2);
		zBuffer[$v]=$f;	//zBuffer is our z-buffer, $f is the depth of the scanline
		ht=Math.floor(64/$f*DistToProjPlane); //height of the scanline
		var dd=Math.abs(c1-$f);	//change in distance from previous $f
		var $k=Math.floor(playerEyeLevel-ht/2);	//the top of our scanline
		var $l=Math.floor(playerEyeLevel+ht/2); //the bottom of the scanline
		var b3=$k;	//starting position for scanning

		//a0 is the x pixel position in the texture
		//u will go from 0 to 63 so dividing by 4 gets us 0 to 15
		var a0=u/4;

		if(dd > 64 && Lht > ht)  //Lht is the previous scanline height
			ht=Lht;

		if($k<0)	//make sure we are not trying to draw above the view area
			$k=0;

		if($l>=H) //if $l is greater than the height of the view area then adjust
			$l=H-1;

		x=Math.floor($o/64); //our tile position
		y=Math.floor($p/64);

		//if we're out of bounds of the map
		//and the level is less than 5 then
		//alternate wall tiles
		//otherwise use the enemy sprite as a wall
		//tile and alternate it.
		//if we're in bounds then use the default
		//wall tile 0
		var pat=(x<0||x>15)&&y%2?1:gameLevel>4?2:0;

		//start at the top of the scanline and work down
		for(y=$k;y<$l;y++)
		{
			//var bit=0; //not actually used for anything.

			//the row of pixels is based on the current y
			//y position. >>2 divides by 4.  64/4==16
			var b1=((y-b3)/ht*64)>>2;


			//we're subtracting from 15 because the tiles
			//are stored upside down
			var b2=bm[pat][15-b1]&1<<(a0&15);

			if(
				!(
				b2 ||	// is the color 1 or 0?
				($v && $d != a6) ||	//is $v 0 and $d not equal to a6 ($d is the prior version of a6)
				(dd >= 64 && $v) ||	//if our change in distance is greater than 64 and $v is non 0
				($f >= 64*3 && $f<64*4 && $v%4==y%4) ||	//skip pixels based on distance from player
				($f >= 64*4 && $f<64*6 && $v%3==y%3) || //this is how the "lighting" is done
				($f >= 64*6 && $v%2==y%2)
				)
			)
				PlotPixel($v,y) //if after all of the checks we having something to plot
		}

		a+=R;	//increment the ray angle
		c2+=R;	//
	}
}

//number rendering function
//$a is the number
//$m is the x coordinate to draw at
//$k is the y coordinate to draw at
//r determines whether to invert the colors
// of the number
function DrawNumber(a,$m,$k,r) //A6()
{
	//if the number is less than 1 then just draw 0
	if(a<1)
	{
		DrawDigit(0,$m,$k)
	}
	else
	{
		//this formula returns the approx number of digits in the number
		//if a is 898 then log(a)/log(10) (where log is the natural log)
		//is equal to ~2.9 with the floor puts it at 2. 10^2 is 100.
		//898/100 is 8.98 and the floor reduces it to 8 which is the
		//value of the digit we were looking for.  We then subtract
		//800 from the original value and go to the next digit
		for(i=Math.floor(Math.log(a)/Math.log(10));i>=0;i--,$m+=4)
		{
			var t=Math.pow(10,i);
			var j=Math.floor(a/t);
			DrawDigit(j,$m,$k,r);
			a-=j*t;
		}
	}
}

//this function draws individual digits
function DrawDigit(a,$m,$k,r) //A7()
{
	for(k=0;k<5;k++)//there are five rows of pixels per number
	{
		var d=FontMap[a*5+k]; //get the numeric value for the row of pixels
		if(r)//if r is non zero then invert the color of the pixels
		{
			d=7-d;
		}
		//each row has three pixels.
		//&4 is the first pixel
		//&2 is the second pixel
		//&1 is the third pixel
		//apparently this guy is used to working with big endien systems.
		//"normally" binary is 1 2 4 8 16 32 ... etc
		//this is working with etc ... 32 16 8 4 2 1
		PlotPixel($m+1,$k+k,d&4);
		PlotPixel($m+2,$k+k,d&2);
		PlotPixel($m+3,$k+k,d&1)
	}
}

//this is the function which renders the sprite
//tile is the sprite number, mask is the mask number
//r determins if we are inverting the colors
//$f tells the function if this is a sprite or or wall
function DrawSprite(tile,mask,sy,sx,dy,dx,$f,r)
{
	var ht=Math.abs(dy-sy);
	var wd=Math.abs(dx-sx);
	var $g=0;
	var pY;
	var pX;
	var clr;
	var msk;

	if(sy<0)
		sy=0;
	if(dy>=H)
		dy=H-1;
	for(k=sx;k<dx;k++) // drawing from left to right
	{
		//if $f is zero then we draw as long as it is on the screen
		//otherwise check zBuffer which holds scanline information
		//for visibility, if something already occupies the at
		//a closer depth then we know that whatever we were
		// attempting to draw
		//is hidden so we do not draw it
		if(k>=0&&k<=W&&!($f&&($f>zBuffer[k])))
		{
			//what pixel in the sprite we are looking at
			pX=Math.floor((k-sx)/wd*16)&15;

			for(j=sy;j<dy;j++) // and then top to bottom
			{
				// the y line of the sprite
				pY=15-Math.floor((j-sy)/ht*16);

				//actual color
				clr=bm[tile][pY]&1<<pX;

				//value of the mask
				msk=bm[mask][pY]&1<<pX;

				//if the mask is non zero plot the
				//actual color (black is 1 in the bm)
				if(msk)
				{
					PlotPixel(k,j,clr?!r:r);
					$g=1
				}
			}
		}
	}
	return $g
}

//this is the function to plot a pixel at x,y with color v
function PlotPixel(x,y,v)
{
	var Q=y*16+(x>>3); //Q = y * 16 + (unsigned int)x/8  (16*8=128 pixels width)
	x=1<<(x&7);  //equivelent to: Math.pow(2,x%8);
	p[Q]=v?p[Q]&(255-x):p[Q]|x;
}

//this is the function to display the screen to the user
//cz set to 2 displays the red "blood" otherwise the
//rendered frame is shown
function ShowScreen(cz)
{
	for(i in p)
		b[i]=N[cz?0:255-p[i]];
	z="#define t_";
	im=z+"width "+W+"\n"+z+"height "+(H+8)+"\nstatic char t_bits[] = {"+b.join(",")+"}";
	d.screen.src=cz==2?"r.gif":"javascript:"+(frameNumber++)+";im;"
}

//this function is the main loop
function tk()
{
	if(frameDelay>0) 	// frameDelay is a pause variable.
						// frameDelay*50ms is the time delay before we actually start
						// doing anything again
	{
		frameDelay--;
		return;
	}
	if(numMonsters-numKilled<2) //numMosters is 1 greater than there actually are
								//so if 1 is left then there are zero left
	{
		Start();				//start a new level
		return;
	}
	for(i in $h)
	{
		var o=$h[i];
		if(!o.z)
		{
			if(o.c<3) //if the object is not out of view of the player for 3 frames
			{		  //then move the monster otherwise it can stay hiding
				if(IsNotValidLocation(o.x+o.dx,o.y+o.dy))
				{	//if the enemy hit a wall then reverse its direction
					//of travel.
					o.dx=-o.dx;
					o.dy=-o.dy;
				}
				//move the enemy
				o.x+=o.dx;
				o.y+=o.dy;

				//set the move flag to one so we update the screen
				M=1
			}

			if(!o.i&&Math.abs(o.x-playerX)<64&&Math.abs(o.y-playerY)<64)
			{//player ran into a health.  Make it go away and reward the player
			 //set cz to 1 so that we do not display the flash of red
				o.z=1;
				playerHealth+=(64-playerHealth)/4;
				cz=1;
			}
		}
	}
	if(U) //if we are rotating adjust the rotation angle
	{
		playerRotation-=U*RAD;  //playerRotation is the players view angle
		M=1			//M=1 indicates we need to update the screen
	}
	if(fwd) //if we are moving forward/backwards
	{
		//store the new coordinates in temporary variables
		var c8=playerX+fwd*Math.cos(playerRotation);
		var c9=playerY+fwd*Math.sin(playerRotation);

		if(!IsNotValidLocation(c8,c9)) //if we have not collided with anything
		{
			playerX=c8; //set the players location to the new location
			playerY=c9;
			M=1		//we moved so update the screen
		}
	}
	if(M) //if something moved (not sure why we care if something moved)
	{
		M=0;	//we do not want to come back in here until something changes
		RayCast();	//ray cast the view area

		//find the angle between the player and the object
		var cz;
		var tx=Math.cos(playerRotation);
		var ty=Math.sin(playerRotation);
		//var $z=Math.sqrt(tx*tx+ty*ty); 	//sqrt(cos^2 + sin^2) is always 1
											//this probably did something useful
											//at one time
		$z=1;
		for(i in $h)
		{
			var o=$h[i];
			var x=o.x-playerX;
			var y=o.y-playerY;
			o.d=Math.sqrt(x*x+y*y);//distance to object
			o.a=Math.acos((tx*x+ty*y)/(o.d)); //angle of line between the two
			if(tx*y-ty*x<0) //if the translated/rotated x distance is less than 0
				o.a=-o.a
		}

		//sort the array of objects
		$h.sort(function(a,b){return b.d-a.d});
		for(i in $h)
		{
			var o=$h[i];
			var ht=Math.floor(64/o.d*DistToProjPlane);
			var $k=Math.floor(playerEyeLevel-ht/2);
			var $l=Math.floor(playerEyeLevel+ht/2);

			var pat=o.i?2:3; //if i is zero then it is a monster, otherwise it is health
			var a9=o.i?5:4;  //get the mask, for no particular reason this is flipped

			o.l=Math.floor(W/2+o.a/R-ht/2);
			o.r=o.l+ht;
			if(o.z) //o.z determines if the object is dead
			{
				if(o.i)//if this is a monster
				{
					pat=8; //set it to a dead monster sprite
					a9=9
				}
				else // there is no dead sprite for anything else
					continue
			}

			if(o.i&&!playerDead&&o.c==1&&!o.z&&Math.random()<.05)
			{//player hit
				playerHealth-=Math.floor(Math.random()*8); //reduce health 0-8 random
				cz=frameDelay=2; //set CZ to show red screen, PZ set to 2 (2 frame delay)
				if(playerHealth<0) //if health is less than zero
				{
					playerDead=1; //player is dead
					playerEyeLevel=H/8; //set the camera Y to 64/8 (fall down)
				}
			}
			if(o.d>64&&DrawSprite(pat,a9,$k,o.l,$l,o.r,o.d))
				o.c=1; //o.c 1 indicates the monster is visible
			else
				o.c++; //otherwise count frames monster not visible to player
		}
		//this is our status information
		DrawNumber(playerPoints,2,H+1); //points
		DrawNumber(numMonsters-numKilled-1,26,H+1); //number of enemies left
		if(!playerDead)//if we're not dead then draw the gun
			DrawSprite(6,7,H-32,W/2-16,H,W/2+16,0);
		for(i=0;i<playerHealth;i++)//draw our health bar
			PlotPixel(W-2-i,H+3,1);
		ShowScreen(cz);//display the final screen to the user
	}
}

function Start()
{
	//this function generates the initial screen and initializes
	//the map and object locations

	frameDelay=36;  				// we want to wait 36 frame delays before the game actually starts
	gameLevel++;					// increment the level number
	playerX=playerY=128;						// initial player location
	numKilled=numMonsters=playerRotation=0;
	p=[].concat(BlankScreen); 			// store the blank screen in the "video memory"
	DrawNumber(gameLevel,W/2-2,H/2,1); 	// draw the level number on the screen
	ShowScreen(); 						// display the result to the user

	w=[];								// w is the world map,
	var d1=30+4*gameLevel; 				// d1 is the number of wall cubes that will be put in the map
										// we do not care if they are all in unique locations
	while(d1)
	{
		x=Math.floor(Math.random()*16);
		y=Math.floor(Math.random()*16);
		if(x*y>4)
		{
			w[y]=w[y]|1<<x;				//w is an array of bits and we have a 16x16 map
			d1--
		}
	}
	$h=[];								//$h holds all the object information
	i=6+4*gameLevel; 		 			//i is the number of objects
	while(i)
	{
		x=64*(Math.floor(Math.random()*12)+2); //random location for object
		y=64*(Math.floor(Math.random()*12)+2);
		j=i%8?1:0; 								//one in every eight objects is a health kit
		if(!IsNotValidLocation(x,y)) 			//make sure the location is valid
		{
			var o=[];
			o.x=x;
			o.y=y;
			o.i=j; 													//i is the object type.  1 == monster 0 == health
			k=Math.random()>.5?1:-1; //random starting movement
			o.dx=j?Math.floor(Math.random()*64/4*gameLevel)*k:0; 	//no special handling for health
			o.dy=j?Math.floor(Math.random()*64/4*gameLevel)*k:0; 	//just set its movement to zero
			o.z=0; 													//we are not dead yet
			o.c=0; 													//meaningless default value
			$h[$h.length]=o; 										//store the object
			i--; 													//we have i-1 to go
			numMonsters+=j											//number of enemies, only add one if not health
		}
	}
}

//onkeydown function
function KeyDown(e) //K()
{
	Z=IsNetscape?e.which:event.keyCode;
	if(!playerDead&&Z==70&&!frameDelay) //32 => space
	{
		DrawSprite(10,10,H-32,W/2-16,H,W/2+16,0,1);
		ShowScreen();
		for(i in $h)
		{
			var o=$h[i];
			if(o.i&&!o.z&&o.l<W/2&&o.r>W/2&&o.c==1)
			{
				o.z=1;
				numKilled++;	//numKilled is the kill count
				playerPoints+=10*(gameLevel+Math.floor(o.d/64))
			}
		}
		M=1
	}

	Z=Z&223; //223 => 11111011 - 32 is masked out so we do this here, after space is checked for

	U=Z==74?12:Z==76?-12:U;  //if J is pressed rotate 12 degrees, if L is pressed rotate -12 degrees

	if(!playerDead&&Z==75) //75 => K - UP
		fwd=64/3;
	if(!playerDead&&Z==77) //77 => M - DOWN
		fwd=-64/3;
}

//onkeyup function
function KeyUp(e) //L()
{
	Z=IsNetscape?e.which&223:event.keyCode;
	if(Z==74||Z==76) //74 => J 76 => L
		U=0;
	if(Z==75||Z==77) //75 => K 77 => M
		fwd=0
}
