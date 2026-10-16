/**
 * Set walk batch 91, part g (2026-10-16): the collect evidence and Case cards of Murders at Karlov Manor (MKM, MKC), and older Cases.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const solved = (game: Game, id: ObjectId): boolean => game.state.objects[id].solved === true;
const canCast = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
/** Alice's end step, its triggers resolved — then on to her next main phase. */
const endStepThenNextTurn = (game: Game): void => {
  toStep(game, "end");
  settle(game);
};
const toAlicesNextMain = (game: Game): void => {
  nextTurn(game);
  nextTurn(game);
};

describe("Case of the Ransacked Lab", () => {
  it("instant and sorcery spells you cast cost {1} less", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const divination = toHand(game, "Divination");
    expect(canCast(game, divination)).toBe(false);
    spawn(game, "Case of the Ransacked Lab");
    expect(canCast(game, divination)).toBe(true);
    const before = hand(game).length;
    cast(game, divination);
    // Divination left the hand, two cards came in; nothing else drew (unsolved).
    expect(hand(game).length).toBe(before - 1 + 2);
  });

  it("solves only after four instant and sorcery spells in a turn; solved, each one cast draws a card", () => {
    const { game } = table({ life: 40 }); // eight Lava Spikes at bob
    const lab = spawn(game, "Case of the Ransacked Lab");
    lands(game, "Mountain", 4);
    const spike = (): void => cast(game, toHand(game, "Lava Spike"), { targets: [ref(B)] });
    const start = hand(game).length;
    for (let i = 0; i < 3; i += 1) spike();
    expect(hand(game).length).toBe(start); // unsolved: no draws
    endStepThenNextTurn(game);
    expect(solved(game, lab)).toBe(false);
    toAlicesNextMain(game);
    for (let i = 0; i < 4; i += 1) spike();
    endStepThenNextTurn(game);
    expect(solved(game, lab)).toBe(true);
    toAlicesNextMain(game);
    const now = hand(game).length;
    spike();
    expect(hand(game).length).toBe(now + 1);
  });
});

describe("Case of the Gorgon's Kiss", () => {
  it("destroys up to one creature that was dealt damage this turn, whoever controls it", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    const seen = watchTargets(a, () => [giant]);
    cast(game, toHand(game, "Case of the Gorgon's Kiss"));
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("up to one: may destroy nothing", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    pickTargets(a, null);
    const kiss = toHand(game, "Case of the Gorgon's Kiss");
    cast(game, kiss);
    expect(zone(game, kiss)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("solves once three creature cards went to any graveyards this turn (tokens and noncreature cards don't count), then is a 4/4 deathtouch lifelink Gorgon", () => {
    const { game } = table();
    const kiss = spawn(game, "Case of the Gorgon's Kiss");
    expect(types(game, kiss)).not.toContain("creature");
    // This turn: two creature cards, a creature token and a noncreature card.
    destroy(game, spawn(game, "Grizzly Bears", B));
    toGraveyard(game, "Hill Giant");
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 });
    const soldier = game.battlefield.find((id) => game.state.objects[id].isToken === true);
    expect(soldier).toBeDefined();
    destroy(game, soldier as ObjectId);
    toGraveyard(game, "Lava Spike");
    endStepThenNextTurn(game);
    expect(solved(game, kiss)).toBe(false);
    // Alice's next turn: three creature cards, one of them bob's.
    toAlicesNextMain(game);
    destroy(game, spawn(game, "Grizzly Bears", B));
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Llanowar Elves");
    endStepThenNextTurn(game);
    expect(solved(game, kiss)).toBe(true);
    expect(types(game, kiss)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    expect(subtypes(game, kiss)).toEqual(expect.arrayContaining(["Case", "Gorgon"]));
    expect(pt(game, kiss)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, kiss).has("deathtouch")).toBe(true);
    expect(keywords(game, kiss).has("lifelink")).toBe(true);
  });
});

describe("Vitu-Ghazi Inspector", () => {
  it("with evidence collected: a +1/+1 counter on target creature and 2 life", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const elves = toGraveyard(game, "Grizzly Bears");
    pickFromZone(a, giant, elves);
    pickTargets(a, bears);
    cast(game, toHand(game, "Vitu-Ghazi Inspector"), { kicked: true });
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, elves)).toBe("exile");
    expect(counters(game, bears)).toBe(1);
    expect(life(game)).toBe(22);
  });

  it("without: no trigger at all", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bears]);
    const inspector = toHand(game, "Vitu-Ghazi Inspector");
    cast(game, inspector);
    expect(zone(game, inspector)).toBe("battlefield");
    expect(seen.asked).toBe(0);
    expect(counters(game, bears)).toBe(0);
    expect(life(game)).toBe(20);
  });

  it("can't be cast collecting evidence without 6 mana value in the graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    toGraveyard(game, "Hill Giant");
    const inspector = toHand(game, "Vitu-Ghazi Inspector");
    const kicked = () =>
      game.legalActions(A).filter((l) => l.kind === "cast-spell" && l.card === inspector && l.kicked === true);
    expect(kicked()).toHaveLength(0);
    toGraveyard(game, "Grizzly Bears");
    expect(kicked()).toHaveLength(1);
  });
});

describe("Sample Collector", () => {
  it("attacking: collect evidence 3, and when you do, a +1/+1 counter on target creature you control", () => {
    const { game, a } = table();
    const collector = spawn(game, "Sample Collector");
    const bears = spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a, giant);
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [collector]);
    expect(zone(game, giant)).toBe("exile");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([collector, bears]));
    expect(seen.offered[0]).toHaveLength(2);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, collector)).toBe(0);
  });

  it("declining collects nothing, and nothing triggers", () => {
    const { game, a } = table();
    const collector = spawn(game, "Sample Collector");
    const bears = spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a);
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [collector]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(seen.asked).toBe(0);
    expect(counters(game, bears)).toBe(0);
  });
});
