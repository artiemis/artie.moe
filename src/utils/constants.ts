const model = (path: string) => `/live2d/${path}`;

export const reZeroModels = {
  emilia: [
    model("emilia01/ac_base_emilia01.model3.json"),
    model("emilia_nemaki01/ac_base_emilia_nemaki01.model3.json"),
    model("emilia_dress01/ac_base_emilia_dress01.model3.json"),
  ],
  felix: [
    model("ferris01/ac_base_ferris01.model3.json"),
    model("ferris_dress01/ac_base_ferris_dress01.model3.json"),
    model("ferris_kimono01/ac_base_ferris_kimono01.model3.json"),
  ],
};
