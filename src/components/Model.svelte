<script lang="ts">
  import * as PIXI from "pixi.js";
  import {
    Live2DModel,
    MotionPreloadStrategy,
    MotionPriority,
  } from "pixi-live2d-display";
  import { reZeroModels } from "../utils/constants";
  import { onDestroy, onMount } from "svelte";
  import { fade } from "svelte/transition";

  const audioSrc = new URL(
    "../assets/i-trust-you.m4a",
    import.meta.url
  ).toString();
  const loudNormRatio = 100 / 40;
  const modelName = getModelFromParams() || getRandomModelUrl();
  const gap = modelName.includes("/ferris") ? "gap-6" : "gap-0";

  let canvas = $state<HTMLCanvasElement>();
  let isLoaded = $state(false);

  let audio = $state<HTMLAudioElement>();
  let volume = $state(50);
  let volumeLabel = $state<string>();
  let volumeLabelTimeout = $state<ReturnType<typeof setTimeout>>();

  let app: PIXI.Application;
  let model: Live2DModel;

  $effect(() => {
    if (audio) {
      audio.volume = Math.round(volume / loudNormRatio) / 100;
      volumeLabel = `${volume}%`;
      localStorage.setItem("volume", volume.toString());
    }
  });

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

  function handleKeyDown(e: KeyboardEvent) {
    if (audio) {
      switch (e.key) {
        case "ArrowUp":
          volume = Math.min(100, volume + 5);
          showVolumeLabel();
          break;
        case "ArrowDown":
          volume = Math.max(0, volume - 5);
          showVolumeLabel();
          break;
        case " ":
          audio.paused ? audio.play() : audio.pause();
          break;
      }
    }
  }

  function handleModelDoubleClick() {
    if (!audio && isLoaded) {
      showVolumeLabel();
      audio = new Audio(audioSrc);
      audio.play();

      audio.addEventListener(
        "ended",
        () => {
          audio = undefined;
        },
        { once: true }
      );
    } else {
      audio.paused ? audio.play() : audio.pause();
    }
  }

  function showVolumeLabel() {
    volumeLabel = `${volume}%`;
    clearTimeout(volumeLabelTimeout);
    volumeLabelTimeout = setTimeout(() => (volumeLabel = undefined), 1000);
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

    model = await Live2DModel.from(modelName, {
      motionPreload: MotionPreloadStrategy.NONE,
    });

    app.stage.on("childAdded", () => {
      isLoaded = true;
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

    if (localStorage.getItem("volume")) {
      volume = +localStorage.getItem("volume");
    }
  });

  onDestroy(() => {
    app.destroy(false);
    if (audio) {
      audio.pause();
      audio.remove();
    }
  });
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="grid fixed left-0 bottom-0 z-10 {gap}">
  <div class="mx-auto">
    {#if audio}
      {#if volumeLabel}
        <div transition:fade={{ duration: 100 }} class="text-purple-300">
          {volumeLabel}
        </div>
      {/if}
      <input
        bind:value={volume}
        oninput={showVolumeLabel}
        transition:fade={{ duration: 100 }}
        type="range"
        class="lg:w-48 lg:h-2 w-32 h-2 rounded-xl appearance-none bg-purple-300 accent-purple-400 cursor-pointer"
      />
    {/if}
  </div>
  <canvas
    bind:this={canvas}
    ondblclick={handleModelDoubleClick}
    id="live2d"
    onpointerdown={() => model.motion("Tap")}
    class="lg:w-96 w-44 transition-opacity {isLoaded
      ? 'opacity-1'
      : 'opacity-0'}"
    class:!cursor-pointer={isLoaded}
  ></canvas>
</div>