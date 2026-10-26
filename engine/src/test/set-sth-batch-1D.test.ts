/**
 * Stronghold (STH) — group D of the oldest-first set walk (B184).
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
  hand,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Mind Games", () => {
  it("taps the target and returns to hand with buyback paid", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const wood = spawn(game, "Wall of Wood", B);
    const games = toHand(game, "Mind Games");
    cast(game, games, { targets: [ref(wood)], kicked: true });
    expect(game.state.objects[wood].tapped).toBe(true);
    expect(zone(game, games)).toBe("hand");
  });
});

describe("Mogg Maniac", () => {
  it("deals the damage it's dealt to target opponent", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const maniac = spawn(game, "Mogg Maniac");
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(maniac)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, maniac)).toBe("graveyard");
  });
});

describe("Rolling Stones", () => {
  it("lets a Wall attack", () => {
    const { game, a } = table();
    spawn(game, "Rolling Stones", B);
    const wall = spawn(game, "Wall of Stone");
    attack(game, a, [wall]);
    expect(life(game, B)).toBe(20); // Wall of Stone has 0 power, but it attacked
    expect(game.state.objects[wall].tapped).toBe(true);
  });
});

describe("Scapegoat", () => {
  it("sacrifices a creature and returns any number of your creatures", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const goat = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    cast(game, toHand(game, "Scapegoat"), { targets: [ref(bears), ref(elves)], sacrifice: goat });
    expect(zone(game, goat)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, elves)).toBe("hand");
  });
});

describe("Acidic Sliver", () => {
  it("gives every Sliver, an opponent's too, a sacrifice-for-2-damage ability", () => {
    const { game } = table();
    spawn(game, "Acidic Sliver");
    const theirs = spawn(game, "Muscle Sliver", B);
    lands(game, "Swamp", 2, B);
    toStep(game, "precombat-main", B);
    activate(game, theirs, 0, { player: B, targets: [ref(A)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
  });
});

describe("Victual Sliver", () => {
  it("sacrifices a Sliver for 4 life", () => {
    const { game } = table();
    const sliver = spawn(game, "Victual Sliver");
    lands(game, "Plains", 2);
    activate(game, sliver, 0);
    expect(zone(game, sliver)).toBe("graveyard");
    expect(life(game, A)).toBe(24);
  });
});

describe("Spike Breeder", () => {
  it("removes a counter to make a 1/1 Spike", () => {
    const { game } = table();
    const breeder = spawn(game, "Spike Breeder");
    game.state.objects[breeder].counters["+1/+1"] = 3;
    lands(game, "Forest", 2);
    activate(game, breeder, 1);
    expect(counters(game, breeder)).toBe(2);
    expect(tokensNamed(game, "Spike Token", A)).toBe(1);
  });
});

describe("Contempt", () => {
  it("returns the attacker and the Aura to their owners' hands at end of combat", () => {
    const { game, a } = table();
    lands(game, "Island", 2, B);
    const bears = spawn(game, "Grizzly Bears");
    const contempt = toHand(game, "Contempt", B);
    toStep(game, "precombat-main", B);
    cast(game, contempt, { player: B, targets: [ref(bears)] });
    expect(zone(game, contempt)).toBe("battlefield");
    nextTurn(game);
    const before = hand(game, B).length;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18); // the damage is dealt first
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, B).length).toBe(before + 1);
  });
});

describe("Walking Dream", () => {
  it("stays tapped while an opponent controls two creatures, untaps otherwise", () => {
    const { game } = table();
    const dream = spawn(game, "Walking Dream", A, { tapped: true });
    spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[dream].tapped).toBe(true);
    destroy(game, second);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[dream].tapped).toBe(false);
  });
});

describe("Endangered Armodon", () => {
  it("is sacrificed when you control a creature with toughness 2 or less", () => {
    const { game } = table();
    const armodon = spawn(game, "Endangered Armodon");
    spawn(game, "Grizzly Bears", B); // an opponent's doesn't count
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(zone(game, armodon)).toBe("graveyard");
  });
});
