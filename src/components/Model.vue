<script setup lang="ts">
  import * as PIXI from "pixi.js";
  import {
    Live2DModel,
    MotionPreloadStrategy,
    MotionPriority,
  } from "pixi-live2d-display";
  import { reZeroModels } from "../utils/constants";
  import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";

  const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
  const isLoaded = ref(false);

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

  onMounted(async () => {
    (window as any).PIXI = PIXI;
    app = new PIXI.Application({
      view: canvas.value,
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

    app.stage.on("childAdded", () => {
      isLoaded.value = true;
    });
    app.stage.addChild(model as unknown as PIXI.DisplayObject);

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

  onUnmounted(() => {
    app.destroy(false);
  });
</script>

<template>
  <canvas ref="canvas" id="live2d" @pointerdown="model.motion('Tap')"
    class="left-0 bottom-0 fixed lg:w-96 w-44 transition-opacity"
    :class="[isLoaded ? 'opacity-1' : 'opacity-0', { '!cursor-pointer': isLoaded }]" />
</template>
