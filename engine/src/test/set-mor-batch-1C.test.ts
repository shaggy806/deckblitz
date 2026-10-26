/**
 * Morningtide, batch 186 group C. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  graveyard,
  lands,
  life,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Ballyrush Banneret", () => {
  it("takes {1} off a Kithkin Soldier spell once, and nothing off other spells", () => {
    const { game } = table();
    spawn(game, "Ballyrush Banneret");
    lands(game, "Plains", 1);
    const second = toHand(game, "Ballyrush Banneret");
    cast(game, second);
    expect(zone(game, second)).toBe("battlefield");
    lands(game, "Forest", 1);
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
  });
});

describe("Roar of the Crowd", () => {
  it("counts every permanent you control of the chosen type, a kindred one included", () => {
    const { game, a } = table();
    spawn(game, "Llanowar Elves");
    spawn(game, "Morcant's Eyes");
    spawn(game, "Llanowar Elves", B);
    lands(game, "Mountain", 4);
    a.chooseCreatureTypeFn = () => "Elf";
    cast(game, toHand(game, "Roar of the Crowd"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("Sigil Tracer", () => {
  it("taps itself and another Wizard, summoning sick or not, to copy an instant", () => {
    const { game } = table();
    const tracer = spawn(game, "Sigil Tracer", A, { sick: true });
    const other = spawn(game, "Sigil Tracer", A, { sick: true });
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    activate(game, tracer, 0, { targets: [ref(bolt)] });
    settle(game);
    expect(life(game, B)).toBe(14);
    expect(game.state.objects[tracer].tapped).toBe(true);
    expect(game.state.objects[other].tapped).toBe(true);
  });
});

describe("Scarblade Elite", () => {
  it("exiles an Assassin card from your graveyard to destroy a creature, and needs one", () => {
    const { game } = table();
    const elite = spawn(game, "Scarblade Elite");
    const bears = spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Grizzly Bears");
    expect(() => activate(game, elite, 0, { targets: [ref(bears)] })).toThrow();
    const assassin = toGraveyard(game, "Scarblade Elite");
    activate(game, elite, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, assassin)).toBe("exile");
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Walker of the Grove", () => {
  it("evoked, it's sacrificed and leaves a 4/4 Elemental behind", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const walker = toHand(game, "Walker of the Grove");
    game.dispatch({ type: "cast-spell", player: A, card: walker, targets: [], evoke: true });
    settle(game);
    expect(zone(game, walker)).toBe("graveyard");
    expect(tokensNamed(game, "4/4 Green Elemental Token", A)).toBe(1);
  });
});
