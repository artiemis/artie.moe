<script lang="ts">
  import * as PIXI from "pixi.js";
  import { Live2DModel } from "pixi-live2d-display";
  import { onDestroy, onMount } from "svelte";

  let canvas: HTMLCanvasElement;
  let app: PIXI.Application;
  let model: Live2DModel;

  onMount(async () => {
    (window as any).PIXI = PIXI;
    app = new PIXI.Application({
      view: canvas,
      autoStart: true,
      backgroundAlpha: 0,
      width: 900,
      height: 1000
    });

    model = await Live2DModel.from("https://cdn.arti3.dev/live2d/ram/ram.model3.json");
    app.stage.addChild(model as unknown as PIXI.DisplayObject);

    model.scale.set(0.45);
    model.x = -600
    model.y = -40
  });

  onDestroy(() => {
    app.destroy(false);
  });
</script>

<canvas bind:this={canvas} id="live2d" class="left-0 bottom-0 fixed lg:w-96 w-48" />
