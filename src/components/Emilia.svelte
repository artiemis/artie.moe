<script lang="ts">
  import * as PIXI from "pixi.js";
  import { Live2DModel, MotionPriority } from "pixi-live2d-display";
  import { onDestroy, onMount } from "svelte";

  let canvas: HTMLCanvasElement;
  let app: PIXI.Application;
  let model: Live2DModel;

  function getRandomModelUrl() {
    const baseUrl = "https://cdn.arti3.dev/live2d/";
    const models = [
      "emilia01/ac_base_emilia01.model3.json",
      "emilia_nemaki01/ac_base_emilia_nemaki01.model3.json",
      "emilia_dress01/ac_base_emilia_dress01.model3.json",
    ];

    const choice = models[Math.floor(Math.random() * models.length)];
    return baseUrl + choice;
  }

  onMount(async () => {
    (window as any).PIXI = PIXI;
    app = new PIXI.Application({
      view: canvas,
      autoStart: true,
      backgroundAlpha: 0,
      width: 900,
      height: 900,
    });

    model = await Live2DModel.from(getRandomModelUrl());
    app.stage.addChild(model as unknown as PIXI.DisplayObject);

    canvas.style.cursor = "pointer";

    model.internalModel.motionManager.state.shouldRequestIdleMotion = () => false;
    model.internalModel.motionManager.on("motionFinish", () => {
      setTimeout(() => model.motion("Idle", undefined, MotionPriority.IDLE), 2000);
    });

    model.motion("Idle", undefined, MotionPriority.IDLE);

    model.scale.set(0.45);
    model.x = -600;
    model.y = -70;
  });

  onDestroy(() => {
    app.destroy(false);
  });
</script>

<canvas
  bind:this={canvas}
  on:pointerdown={() => model.motion("Tap")}
  id="live2d"
  class="cursor-pointer left-0 bottom-0 fixed lg:w-96 w-48"
/>
