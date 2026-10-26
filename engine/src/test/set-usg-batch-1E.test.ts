/**
 * Urza's Saga (USG; B193), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Lifeline", () => {
  it("returns a dead creature at the next end step while another creature is on the battlefield", () => {
    const { game } = table();
    spawn(game, "Lifeline");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", A);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "cleanup");
    const back = game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back.length).toBe(2);
    expect(back.some((id) => controller(game, id) === B)).toBe(true);
  });

  it("returns nothing when no other creature is on the battlefield", () => {
    const { game } = table();
    spawn(game, "Lifeline");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    toStep(game, "cleanup");
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears").length).toBe(0);
  });
});

describe("Sleeper Agent", () => {
  it("goes to the target opponent, then deals 2 to its new controller on their upkeep", () => {
    const { game, a } = table();
    a.chooseTargetsFn = () => [ref(B)];
    const agent = game.debugSpawn("Sleeper Agent", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(controller(game, agent)).toBe(B);
    nextTurn(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Attunement", () => {
  it("returns itself to hand as the cost, draws three and discards four", () => {
    const { game } = table();
    const att = spawn(game, "Attunement");
    const before = hand(game).length;
    const gyBefore = graveyard(game).length;
    activate(game, att);
    expect(zone(game, att)).toBe("hand");
    // +1 (Attunement) +3 drawn −4 discarded; Attunement may be among the discards.
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(gyBefore + 4);
  });
});

describe("Darkest Hour", () => {
  it("makes every creature mono-black", () => {
    const { game } = table();
    spawn(game, "Darkest Hour");
    const bears = spawn(game, "Grizzly Bears", B);
    expect([...computeCharacteristics(game.state, registryOf(game), bears).colors]).toEqual(["B"]);
  });
});

describe("Humble", () => {
  it("makes the target a 0/1 with no abilities until end of turn", () => {
    const { game } = table();
    const serra = spawn(game, "Serra Angel", B);
    lands(game, "Plains", 2);
    const humble = toHand(game, "Humble");
    cast(game, humble, { targets: [ref(serra)] });
    expect(pt(game, serra)).toEqual({ power: 0, toughness: 1 });
    expect(keywords(game, serra).has("flying")).toBe(false);
    nextTurn(game);
    expect(pt(game, serra)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Fortitude", () => {
  it("sacrifices a Forest to regenerate the enchanted creature, and returns to hand from the graveyard", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const forests = lands(game, "Forest", 3);
    const fort = toHand(game, "Fortitude");
    cast(game, fort, { targets: [ref(bears)] });
    expect(zone(game, fort)).toBe("battlefield");
    const spare = forests.find((id) => !game.state.objects[id].tapped)!;
    game.dispatch({ type: "activate-ability", player: A, source: fort, abilityIndex: 0, targets: [], sacrifice: spare });
    settle(game);
    expect(zone(game, spare)).toBe("graveyard");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(fort)]);
    settle(game);
    expect(zone(game, fort)).toBe("hand");
  });
});
