 var windowWidth = window.innerWidth,
     windowHeight = window.innerHeight;
 var camera, renderer, scene;
var meshArray = [];
var graph;
 head.ready(function() {
     Init();
     animate();
 });

 function Init() {
     scene = new THREE.Scene();

     //setup camera
     camera = new LeiaCamera({
         cameraPosition: new THREE.Vector3(_camPosition.x, _camPosition.y, _camPosition.z),
         targetPosition: new THREE.Vector3(_tarPosition.x, _tarPosition.y, _tarPosition.z)
     });
     scene.add(camera);

     //setup rendering parameter
     renderer = new LeiaWebGLRenderer({
         antialias: true,
         renderMode: _renderMode,
         shaderMode: _nShaderMode,
         colorMode: _colorMode,
         compFac:_depthCompressionFactor,
         devicePixelRatio: 1
     });
     renderer.Leia_setSize({
         width: windowWidth,
         height: windowHeight,
         autoFit: true
     });
     renderer.shadowMapEnabled = true;
     renderer.shadowMapSoft = true;
     document.body.appendChild(renderer.domElement);

     //add object to Scene
     addObjectsToScene();

     //add Light
     addLights();

     //add Gyro Monitor
     //addGyroMonitor();
 }

 function animate() {
     requestAnimationFrame(animate);
     
     //set mesh animation
    updateStuff();
   
     renderer.Leia_render({
         scene: scene,
         camera: camera,
         holoScreenSize: _holoScreenSize,
         holoCamFov: _camFov,
         upclip: _up,
         downclip: _down,
         filterA: _filterA,
         filterB: _filterB,
         filterC: _filterC,
         messageFlag: _messageFlag
     });
 }

 function addObjectsToScene() {
     //Add your objects here
     createPlane();
 }

function fx(x, y, t){
	if (t==null) t=0;
	var r = Math.sqrt(x*x+y*y);	
	var z = 5*Math.exp(1-r/5)*(Math.cos(1.2*r-t));
	return z;
}

function updateStuff(){
	graph.geometry.verticesNeedUpdate = true;
	graph.geometry.elementsNeedUpdate = true;
	graph.geometry.morphTargetsNeedUpdate = true;
	graph.geometry.uvsNeedUpdate = true;
	graph.geometry.normalsNeedUpdate = true;
	graph.geometry.colorsNeedUpdate = true;
	graph.geometry.tangentsNeedUpdate = true;
	graph.geometry.computeVertexNormals();
	graph.geometry.computeFaceNormals();
}


function createPlane(){
	graph = new THREE.Mesh(new THREE.PlaneGeometry(40, 30, 100, 100), new THREE.MeshLambertMaterial({color:0xffffff}));
	scene.add(graph);
	
	for (var i=0; i<graph.geometry.vertices.length; i++) {
		graph.geometry.vertices[i].z = fx(graph.geometry.vertices[i].x, graph.geometry.vertices[i].y);
	}
	updateStuff();
	
}

function addTextMenu(parameters){
    parameters = parameters || {};
   
   var strText = parameters.text;
   var posX = parameters.positionX;
   var posY = parameters.positionY;
   var posZ = parameters.positionZ;
   var rotateX = parameters.rotateX;
   var rotateY = parameters.rotateY;
   var rotateZ = parameters.rotateZ;
   var name = parameters.name;
   var size = parameters.size;
   if(posX === undefined || posY === undefined || posZ === undefined){
     posX = 0;
     posY = 0;
     posZ = 0;
   }
   if(rotateX === undefined || rotateY === undefined || rotateZ === undefined){
     rotateX = 0;
     rotateY = 0;
     rotateZ = 0;
   }
   var menuGeometry = new THREE.TextGeometry(
        strText, {
            size: size,
            height: 2,
            curveSegments: 4,
            font: "helvetiker",
            weight: "normal",
            style: "normal",
            bevelThickness: 0.6,
            bevelSize: 0.25,
            bevelEnabled: true,
            material: 0,
            extrudeMaterial: 1
        }
    ); 
    var menuMaterial = new THREE.MeshFaceMaterial(
        [
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shading: THREE.FlatShading
            }), // front
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shading: THREE.SmoothShading
            }) // side
        ]
    );
    var menuMesh = new THREE.Mesh(menuGeometry, menuMaterial);
    menuMesh.position.set(posX, posY, posZ);
    menuMesh.rotation.set(rotateX, rotateY, rotateZ);
    menuMesh.castShadow = true;
    menuMesh.receiveShadow = true;
    var group = new THREE.Object3D();
    group.add(menuMesh);
    scene.add(group);
    meshArray.push({meshGroup:group,name:name});
   
 }

 function addLights() {
     //Add Lights Here
      var light = new THREE.SpotLight(0xffffff);
      var xl = new THREE.DirectionalLight( 0xffffff );
			xl.position.set( 1, 0, 2 );
			scene.add( xl );
			//var pl = new THREE.PointLight(0x111111);
			var pl = new THREE.PointLight(0x555555);
			pl.position.set(-20, 10, 20);
			scene.add(pl);
 }

 function addSTLModel(parameters) { //(filename, meshName, meshSize) {
     parameters = parameters || {};
     var path = parameters.path;
     var meshSizeX = parameters.meshSizeX;
     var meshSizeY = parameters.meshSizeY;
     var meshSizeZ = parameters.meshSizeZ;
     var tx = parameters.translateX;
     var ty = parameters.translateY;
     var tz = parameters.translateZ;
     var meshName = parameters.meshGroupName;
     if (parameters.meshSizeX === undefined || parameters.meshSizeY === undefined || parameters.meshSizeZ === undefined) {
         meshSizeX = 1;
         meshSizeY = 1;
         meshSizeZ = 1;
     }
     var xhr1 = new XMLHttpRequest();
     xhr1.onreadystatechange = function() {
         if (xhr1.readyState == 4) {
             if (xhr1.status == 200 || xhr1.status === 0) {
                 var rep = xhr1.response;
                 var mesh1;
                 mesh1 = parseStlBinary(rep, 0xffffff);
                 mesh1.material.side = THREE.DoubleSide;
                 mesh1.castShadow = true;
                 mesh1.receiveShadow = true;
                 mesh1.material.metal = true;
                 mesh1.scale.set(meshSizeX, meshSizeY, meshSizeZ);
                 mesh1.position.set(tx, ty, tz);
                 var group = new THREE.Object3D();
                 group.add(mesh1);
                 scene.add(group);
                 meshArray.push({
                     meshGroup: group,
                     name: meshName
                 });
                 // newMeshReady = true;
             }
         }
     };
     xhr1.onerror = function(e) {
         console.log(e);
     };
     xhr1.open("GET", path, true);
     xhr1.responseType = "arraybuffer";
     xhr1.send(null);
 }

function LEIA_setBackgroundPlane(filename, aspect) {
    var foregroundPlaneTexture = new THREE.ImageUtils.loadTexture(filename);
    foregroundPlaneTexture.wrapS = foregroundPlaneTexture.wrapT = THREE.RepeatWrapping;
    foregroundPlaneTexture.repeat.set(1, 1);

    //
    var planeMaterial = new THREE.MeshPhongMaterial({
        map: foregroundPlaneTexture,
        color: 0xffdd99
    });
    var planeGeometry = new THREE.PlaneGeometry(100, 75, 10, 10);
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.z = -6;
    plane.castShadow = false;
    plane.receiveShadow = true;
    scene.add(plane);
}

