<script lang="ts">
  import * as PIXI from "pixi.js";
  import {
    Live2DModel,
    MotionPreloadStrategy,
    MotionPriority,
  } from "pixi-live2d-display";
  import { onDestroy, onMount } from "svelte";
  import { reZeroModels } from "../utils/constants";

  let canvas: HTMLCanvasElement;
  let app: PIXI.Application;
  let model: Live2DModel;

  function getModelFromParams(): string | undefined {
    if (location.search) {
      const params = new URLSearchParams(location.search);
      const modelKey = params.get("model");
      if (!modelKey) return;
      const model = modelKey.match(/^([a-zA-Z]+)(\d+)$/);
      if (!model) return;
      const [_, key, index] = model;
      return reZeroModels[key]?.[+index];
    }
  }

  function getRandomModelUrl() {
    let choices = reZeroModels.emilia;
    // 20% chance to roll a Felix model
    if (Math.random() <= 0.2) {
      choices = reZeroModels.felix;
    }
    return choices[Math.floor(Math.random() * choices.length)];
  }

  onMount(async () => {
    (window as any).PIXI = PIXI;
    app = new PIXI.Application({
      view: canvas,
      autoStart: true,
      backgroundAlpha: 0,
      width: 900,
      height: 980,
    });

    model = await Live2DModel.from(
      getModelFromParams() || getRandomModelUrl(),
      {
        motionPreload: MotionPreloadStrategy.NONE,
      }
    );
    app.stage.addChild(model as unknown as PIXI.DisplayObject);

    canvas.style.cursor = "pointer";

    model.internalModel.motionManager.state.shouldRequestIdleMotion = () =>
      false;
    model.internalModel.motionManager.on("motionFinish", () => {
      setTimeout(
        () => model.motion("Idle", undefined, MotionPriority.IDLE),
        2000
      );
    });

    model.motion("Idle", undefined, MotionPriority.IDLE);

    model.scale.set(0.45);
    model.x = -600;
    model.y = 0;
  });

  onDestroy(() => {
    app.destroy(false);
  });
</script>

<canvas
  bind:this={canvas}
  on:pointerdown={() => model.motion("Tap")}
  id="live2d"
  class="cursor-pointer left-0 bottom-0 fixed lg:w-96 w-44"
/>
