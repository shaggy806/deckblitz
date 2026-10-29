/**
 * B253 group E: cards freed by granted statics, rule 305.7's land-type
 * setting, a land type chosen on resolution, and exchange of control.
 */

import { describe, expect, it } from "vitest";

import { intrinsicManaColors } from "../characteristics.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  controller,
  counters,
  enter,
  keywords,
  lands,
  life,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  tokensNamed,
  types,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const colors = (game: Game, id: ObjectId) => intrinsicManaColors(game.state, registryOf(game), game.state.objects[id]);

describe("B253 group E", () => {
  it("The Book of Exalted Deeds: an Angel at 3 life gained; the exiled Book's Angel keeps its controller in", () => {
    const { game } = table();
    const book = spawn(game, "The Book of Exalted Deeds", A);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "3/3 White Angel Token", A)).toBe(1);

    const { game: g2 } = table();
    const book2 = spawn(g2, "The Book of Exalted Deeds", A);
    lands(g2, "Plains", 3);
    const angel = spawn(g2, "Serra Angel", A);
    activate(g2, book2, 0, { targets: [ref(angel)] });
    expect(g2.state.objects[book2].zone).toBe("exile");
    expect(counters(g2, angel, "enlightened")).toBe(1);
    g2.debugApplyEffect(A, { kind: "lose-life", who: "you", amount: 25 });
    settle(g2);
    expect(life(g2, A)).toBeLessThanOrEqual(0);
    expect(g2.state.players[A].hasLost).toBe(false);
    expect(book).toBeDefined();
  });

  it("The Book of Exalted Deeds: no Angel without 3 life gained", () => {
    const { game } = table();
    spawn(game, "The Book of Exalted Deeds", A);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 });
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "3/3 White Angel Token", A)).toBe(0);
  });

  it("Zhao: nonbasic lands enter tapped; with a conqueror counter they're Mountains", () => {
    const { game } = table();
    const zhao = spawn(game, "Zhao, the Moon Slayer", A);
    const coast = enter(game, "Yavimaya Coast", B);
    const forest = enter(game, "Forest", B);
    expect(game.state.objects[coast].tapped).toBe(true);
    expect(game.state.objects[forest].tapped).toBe(false);
    expect(colors(game, coast)).toEqual([]);
    lands(game, "Mountain", 7);
    activate(game, zhao, 0);
    expect(counters(game, zhao, "conqueror")).toBe(1);
    expect(subtypes(game, coast)).toEqual(["Mountain"]);
    expect(colors(game, coast)).toEqual(["R"]);
    expect(subtypes(game, forest)).toEqual(["Forest"]);
  });

  it("March from Velis Vel: lands of the chosen nonbasic type become copies with haste", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const bluffs = spawn(game, "Abraded Bluffs", A);
    const coast = spawn(game, "Yavimaya Coast", A);
    lands(game, "Island", 3);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return "Desert";
    };
    cast(game, toHand(game, "March from Velis Vel"), { targets: [ref(bears)] });
    expect(offered).toContain("Urza's");
    expect(offered).toContain("Desert");
    expect(offered).not.toContain("Forest");
    expect(types(game, bluffs)).toEqual(["creature"]);
    expect(keywords(game, bluffs).has("haste")).toBe(true);
    expect(types(game, coast)).toEqual(["land"]);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(types(game, bluffs)).toEqual(["land"]);
  });

  it("Zombie Trailblazer: a land becomes a Swamp until end of turn", () => {
    const { game } = table();
    const zombie = spawn(game, "Zombie Trailblazer", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    activate(game, zombie, 0, { targets: [ref(coast)] });
    expect(game.state.objects[zombie].tapped).toBe(true);
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    expect(colors(game, coast)).toEqual(["B"]);
  });

  it("Contaminated Ground: the land is a Swamp, and tapping it costs its controller 2 life", () => {
    const { game } = table();
    const coast = spawn(game, "Yavimaya Coast", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Contaminated Ground"), { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    expect(colors(game, coast)).toEqual(["B"]);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(coast)]);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("Lush Growth: the land is a Mountain, Forest and Plains, and taps for R, G or W", () => {
    const { game } = table();
    const coast = spawn(game, "Yavimaya Coast", A);
    spawn(game, "Forest", A);
    cast(game, toHand(game, "Lush Growth"), { targets: [ref(coast)] });
    expect([...subtypes(game, coast)].sort()).toEqual(["Forest", "Mountain", "Plains"]);
    expect([...colors(game, coast)].sort()).toEqual(["G", "R", "W"]);
  });

  it("Pixie Illusionist: kicked, two counters; the land becomes the chosen basic type", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    lands(game, "Island", 1);
    const pixie = toHand(game, "Pixie Illusionist");
    cast(game, pixie, { kicked: true });
    expect(counters(game, pixie)).toBe(2);
    const coast = spawn(game, "Yavimaya Coast", A);
    a.chooseCreatureTypeFn = (_view, _source, options) => (options.includes("Island") ? "Island" : options[0]);
    game.state.objects[pixie].summoningSick = false;
    activate(game, pixie, 0, { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Island"]);
    expect(colors(game, coast)).toEqual(["U"]);
  });

  it("Joven's Tools: only Walls can block the creature this turn", () => {
    const { game, a } = table();
    const tools = spawn(game, "Joven's Tools", A);
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears", A);
    const wall = spawn(game, "Wall of Stone", B);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, tools, 0, { targets: [ref(bears)] });
    const offer = blockOffer(game, a, [bears]);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(eligible(giant)).toEqual([]);
    expect(eligible(wall)).toEqual([bears]);
  });

  it("Eyes Everywhere: it and the target change hands", () => {
    const { game } = table();
    const eyes = spawn(game, "Eyes Everywhere", A);
    lands(game, "Island", 6);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, eyes, 0, { targets: [ref(giant)] });
    expect(controller(game, eyes)).toBe(B);
    expect(controller(game, giant)).toBe(A);
  });

  it("Shrewd Negotiation: your artifact for their creature", () => {
    const { game } = table();
    const relic = spawn(game, "Sol Ring", A);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 5);
    cast(game, toHand(game, "Shrewd Negotiation"), { targets: [ref(relic), ref(giant)] });
    expect(controller(game, relic)).toBe(B);
    expect(controller(game, giant)).toBe(A);
  });
});
