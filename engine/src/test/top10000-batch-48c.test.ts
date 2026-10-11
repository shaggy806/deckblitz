/**
 * Card batch 48, part c (2026-10-11): ranks 6798–6819.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Genesis", () => {
  it("from your graveyard, pays {2}{G} at your upkeep to return a creature card", () => {
    const { game, a } = table();
    toGraveyard(game, "Genesis");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    pickTargets(a, bears);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("hand");
  });

  it("does nothing from the battlefield", () => {
    const { game, a } = table();
    spawn(game, "Genesis");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    pickTargets(a, bears);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Thunderous Velocipede", () => {
  it("one counter at mana value 4 or less, three above it — a noncreature Vehicle too", () => {
    const { game } = table();
    spawn(game, "Thunderous Velocipede");
    const bears = toGraveyard(game, "Grizzly Bears"); // mana value 2
    const wurm = toGraveyard(game, "Craw Wurm"); // mana value 6
    const copter = toGraveyard(game, "Smuggler's Copter"); // a mana value 2 Vehicle
    for (const id of [bears, wurm, copter]) {
      game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(id)]);
      settle(game);
    }
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, wurm)).toBe(3);
    expect(counters(game, copter)).toBe(1);
  });
});

describe("Acclaimed Contender", () => {
  it("with another Knight, finds a Knight, Aura, Equipment or legendary artifact in the top five", () => {
    const { game, a } = table();
    spawn(game, "White Knight");
    const bears = toLibrary(game, "Grizzly Bears");
    const bonesplitter = toLibrary(game, "Bonesplitter");
    const pacifism = toLibrary(game, "Pacifism");
    const knight = toLibrary(game, "Knight of the White Orchid");
    lands(game, "Plains", 3);
    const seen = pickFromZone(a, knight);
    cast(game, toHand(game, "Acclaimed Contender"));
    expect(seen.offered).toEqual(expect.arrayContaining([bonesplitter, pacifism, knight]));
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, knight)).toBe("hand");
  });

  it("without another Knight, doesn't look", () => {
    const { game, a } = table();
    const knight = toLibrary(game, "Knight of the White Orchid");
    lands(game, "Plains", 3);
    const seen = pickFromZone(a, knight);
    cast(game, toHand(game, "Acclaimed Contender"));
    expect(seen.offered).toEqual([]);
    expect(zone(game, knight)).toBe("library");
  });
});

describe("Assemble the Entmoot", () => {
  it("makes three tapped X/X Treefolk with reach counters, X the life gained this turn (losses ignored)", () => {
    const { game } = table();
    const entmoot = spawn(game, "Assemble the Entmoot");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: "you" }, []);
    settle(game);
    activate(game, entmoot, 0);
    expect(zone(game, entmoot)).toBe("graveyard");
    const trees = game.battlefield.filter((id) => game.state.objects[id].cardName === "Treefolk Token (Sylvan Offering)");
    expect(trees.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(3);
    for (const id of trees) {
      expect(game.state.objects[id].tapped).toBe(true);
      expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
      expect(counters(game, id, "reach")).toBe(1);
      expect(keywords(game, id).has("reach")).toBe(true);
    }
  });
});

describe("Archfiend of the Dross", () => {
  it("enters with four oil counters and loses you the game when the last comes off", () => {
    const { game } = table();
    const fiend = toGraveyard(game, "Archfiend of the Dross");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(fiend)]);
    settle(game);
    expect(counters(game, fiend, "oil")).toBe(4);
    game.state.objects[fiend].counters.oil = 1;
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("gone before the trigger resolves, it reads the one counter it left with — no loss (the ruling)", () => {
    const { game } = table();
    const fiend = spawn(game, "Archfiend of the Dross");
    game.state.objects[fiend].counters.oil = 1;
    toStep(game, "upkeep");
    expect(game.state.zones.shared.stack.length).toBe(1);
    destroy(game, fiend);
    expect(zone(game, fiend)).toBe("graveyard");
    expect(game.state.players[A].hasLost).toBe(false);
  });
});

describe("Exsanguinator Cavalry", () => {
  it("a Knight connecting gets a counter and makes a Blood token; another creature doesn't", () => {
    const { game, a } = table();
    spawn(game, "Exsanguinator Cavalry");
    const knight = spawn(game, "White Knight");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [knight, bears]);
    expect(counters(game, knight)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });
});

describe("Curator Beastie", () => {
  it("its manifest dread's face-down 2/2 is colourless and enters with two +1/+1 counters", () => {
    const { game } = table();
    enter(game, "Curator Beastie");
    const faceDown = game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined);
    expect(faceDown).toHaveLength(1);
    expect(counters(game, faceDown[0])).toBe(2);
    expect(pt(game, faceDown[0])).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Chance Encounter", () => {
  it("wins at your upkeep with ten luck counters, not nine", () => {
    const { game } = table();
    const encounter = spawn(game, "Chance Encounter");
    game.state.objects[encounter].counters.luck = 9;
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.result.over).toBe(false);
    game.state.objects[encounter].counters.luck = 10;
    game.advanceUntil((s) => s.result.over || (s.turn.number === 5 && s.turn.step === "draw"));
    expect(game.state.result.winner).toBe(A);
  });
});

describe("Summon: Primal Garuda", () => {
  it("chapter I can target only a tapped creature an opponent controls", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const lions = spawn(game, "Savannah Lions", B, { tapped: true });
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Savannah Lions", A, { tapped: true });
    lands(game, "Plains", 4);
    // Two legal targets, so the choice is asked (a lone one is chosen for you).
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Summon: Primal Garuda"));
    expect([...seen.offered[0]].sort()).toEqual([bears, lions].sort());
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).not.toContain(mine);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

