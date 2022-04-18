import React from 'react';
import { FreeCamera, 
  Vector3, 
  HemisphericLight, 
  MeshBuilder, 
  Quaternion, 
  PointerEventTypes, 
  SceneLoader,
  Animation, 
  ActionManager,
  ExecuteCodeAction,
Mesh,
StandardMaterial,
Texture,
Color3} from '@babylonjs/core';
import SceneComponent from 'babylonjs-hook';
import './App.css';

let box;
var camera;

const BOXES_SIZE = 2;
const PATH_SCENE_BABYLON = "./Cena Auditorio/scene.babylon"

var useRotationNotTarget, useBox;

function Movement(camera){
  camera.keysUp.push(87);
  camera.keysLeft.push(65);
  camera.keysDown.push(83);
  camera.keysRight.push(68);
}

function MakeCameraCollision(camera, scene){
  scene.gravity = new Vector3(0, -0.15, 0);
  camera.applyGravity = true;
  camera.ellipsoid = new Vector3(1, 1, 1);
  scene.collisionsEnabled = true;
  camera.checkCollisions = true;
}



function PointnClick(scene, camera){
  scene.onPointerObservable.add(function (pointerInfo) {
    switch (pointerInfo.type) {
        case PointerEventTypes.POINTERPICK:
            let m = pointerInfo.pickInfo.pickedMesh;

            if (m.name === "Plane") {

                var position = pointerInfo.pickInfo.pickedPoint
                position.y += 1
                var direction = pointerInfo.pickInfo.ray.direction
                direction.y = 0
                var target = position.add(direction)
                var tempCamera = camera.clone()
                tempCamera.position = position
                tempCamera.setTarget(target)
                var start = Quaternion.FromRotationMatrix(camera.getWorldMatrix())
                var end = Quaternion.FromRotationMatrix(tempCamera.getWorldMatrix())
                tempCamera.dispose()
                //change options
                useBox = false; //shows box transition instead of camera, but not with target animation
                useRotationNotTarget = false;

                var node = useBox ? box : camera;
                Animation.CreateAndStartAnimation("transition", node, "position", 60, 60, camera.globalPosition, position, Animation.ANIMATIONLOOPMODE_CONSTANT);
                if (useRotationNotTarget) {
                  Animation.CreateAndStartAnimation("transition", node, "rotation", 30, 30, start.toEulerAngles(), end.toEulerAngles(), Animation.ANIMATIONLOOPMODE_CONSTANT);
                } else {
                  Animation.CreateAndStartAnimation("transition", node, "target", 6, 4, camera.getTarget(), target, Animation.ANIMATIONLOOPMODE_CONSTANT);
                }

            }

            break;
    }
});
}

function plane(scene){
  const plane = MeshBuilder.CreatePlane("plane", {height:2, width: 1, sideOrientation: Mesh.DOUBLESIDE});
  plane.scaling.x = 15;
  plane.scaling.y = 4;
  plane.position.x = -25;
  plane.position.y = 10;
  plane.position.z = 14.8;

  
  plane.rotation.y = 1.6;

      
  plane.actionManager = new ActionManager(scene);
  plane.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, function () {
    window.open("https://www.facebook.com")
  }));

 
  var texture_plane = new StandardMaterial("plane_texture", scene);
  texture_plane.diffuseTexture = new Texture(`https://www.internetmatters.org/wp-content/uploads/2021/03/facebook-logo-new-600x315.png`, scene);
  texture_plane.emissiveTexture = new Texture(`https://www.internetmatters.org/wp-content/uploads/2021/03/facebook-logo-new-600x315.png`, scene);
  texture_plane.specularColor = Color3.FromHexString("#000000")
  plane.material = texture_plane;
}

const onSceneReady = scene => {
  // This creates and positions a free camera (non-mesh)
  camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

  SceneLoader.Append(PATH_SCENE_BABYLON, "", scene)
  const canvas = scene.getEngine().getRenderingCanvas();
  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());
  
  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

   
  let camSphere = MeshBuilder.CreateSphere("sphere", { diameterY: 3, diameterX: 0.1 }, scene);
  camSphere.parent = camera;
  camSphere.visibility = 0;
  
  
  MakeCameraCollision(camera, scene);

  Movement(camera);

  PointnClick(scene, camera);

  plane(scene);
 

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;
  

  // Our built-in 'box' shape.
  box = MeshBuilder.CreateBox("box", {size: BOXES_SIZE}, scene);

  // // Move the box upward 1/2 its height
  box.position.y = 1;
  box.checkCollisions = true; // Collision box
  
  box.actionManager = new ActionManager(scene);
  box.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, function () {
      window.open("https://www.google.com/search?client=opera-gx&q=cube&sourceid=opera&ie=UTF-8&oe=UTF-8")
  }));
  
}

/**
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender = scene => {
  if (box !== undefined) {
    var deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 10;
    box.rotation.y += ((rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000));
  }
}



function App() {

  return (
    <div className="App">
      <header className="App-header">
        <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='my-canvas' style={{width:"100vw", height: "100vh"}} />
      </header>
    </div>
  );
}

export default App;
