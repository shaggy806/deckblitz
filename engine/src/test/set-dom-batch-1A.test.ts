/**
 * Dominaria, batch 1, group A.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Wizard's Lightning", () => {
  it("costs {R} with a Wizard and deals 3 damage", () => {
    const { game } = table();
    spawn(game, "Prodigal Sorcerer");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Wizard's Lightning"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Merfolk Trickster", () => {
  it("taps the target and it loses its abilities until end of turn", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    pickTargets(a, angel);
    enter(game, "Merfolk Trickster");
    expect(game.state.objects[angel].tapped).toBe(true);
    expect(keywords(game, angel).has("flying")).toBe(false);
  });
});

describe("Blink of an Eye and Hallar, the Firefletcher", () => {
  it("kicked, bounces and draws, and Hallar grows and burns each opponent", () => {
    const { game } = table();
    const hallar = spawn(game, "Hallar, the Firefletcher");
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Blink of an Eye");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(bears)], kicked: true });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before - 1 + 1);
    expect(counters(game, hallar)).toBe(1);
    expect(life(game, B)).toBe(19);
  });

  it("unkicked, doesn't draw or trigger Hallar", () => {
    const { game } = table();
    const hallar = spawn(game, "Hallar, the Firefletcher");
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Blink of an Eye");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before - 1);
    expect(counters(game, hallar)).toBe(0);
    expect(life(game, B)).toBe(20);
  });
});

describe("Fall of the Thran", () => {
  it("destroys all lands, then each player returns two (or all they have) to the battlefield", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    lands(game, "Wastes", 1, B);
    lands(game, "Plains", 6);
    const saga = toHand(game, "Fall of the Thran");
    cast(game, saga);
    expect(named(game, "Plains").length).toBe(0);
    expect(named(game, "Wastes").length).toBe(0);
    const mine = graveyard(game, A).filter((id) => game.state.objects[id].cardName === "Plains");
    expect(mine.length).toBe(9);
    pickFromZone(a, mine[0], mine[1]);
    toStep(game, "precombat-main");
    settle(game);
    expect(named(game, "Plains", A).length).toBe(2);
    const wastes = named(game, "Wastes");
    expect(wastes.length).toBe(1);
    expect(controller(game, wastes[0])).toBe(B);
  });
});

describe("Settle the Score", () => {
  it("exiles the creature and puts two loyalty counters on your planeswalker", () => {
    const { game } = table();
    const jace = spawn(game, "Jace Beleren");
    const before = counters(game, jace, "loyalty");
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Settle the Score"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, jace, "loyalty")).toBe(before + 2);
  });
});

describe("Powerstone Shard", () => {
  it("adds {C} for each Powerstone Shard you control", () => {
    const { game } = table();
    const shard = spawn(game, "Powerstone Shard");
    spawn(game, "Powerstone Shard");
    spawn(game, "Powerstone Shard", B);
    activate(game, shard);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["C", "C"]);
  });
});

describe("Urgoros, the Empty One", () => {
  it("makes the player discard at random, and draws you a card only when they can't", () => {
    const { game, a } = table();
    const urgoros = spawn(game, "Urgoros, the Empty One");
    const theirs = hand(game, B).length;
    const mine = hand(game).length;
    attack(game, a, [urgoros]);
    expect(hand(game, B).length).toBe(theirs - 1);
    expect(hand(game).length).toBe(mine);
  });

  it("draws you a card when the player has no cards", () => {
    const { game, a } = table();
    const urgoros = spawn(game, "Urgoros, the Empty One");
    game.debugApplyEffect(A, { kind: "discard-hand", who: "each-opponent" }, []);
    expect(hand(game, B).length).toBe(0);
    const mine = hand(game).length;
    attack(game, a, [urgoros]);
    expect(hand(game).length).toBe(mine + 1);
  });
});

describe("Territorial Allosaurus", () => {
  it("kicked, fights another target creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const allosaurus = toHand(game, "Territorial Allosaurus");
    cast(game, allosaurus, { kicked: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, allosaurus)).toBe("battlefield");
    expect(game.state.objects[allosaurus].damageMarked).toBe(2);
  });
});

describe("Radiating Lightning", () => {
  it("deals 3 to the player and 1 to each creature that player controls", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const elves = spawn(game, "Llanowar Elves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Llanowar Elves");
    cast(game, toHand(game, "Radiating Lightning"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Warcry Phoenix", () => {
  it("returns from the graveyard tapped and attacking when you attack with three creatures", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const phoenix = toGraveyard(game, "Warcry Phoenix");
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    pickModes(a, 0);
    attack(game, a, attackers);
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(game.state.objects[phoenix].tapped).toBe(true);
    expect(life(game, B)).toBe(20 - 6 - 2);
  });
});

describe("Sanctum Spirit", () => {
  it("discards only a historic card to gain indestructible", () => {
    const { game, a } = table();
    const spirit = spawn(game, "Sanctum Spirit");
    const blade = toHand(game, "Bonesplitter");
    const bears = toHand(game, "Grizzly Bears");
    pickFromZone(a, blade);
    activate(game, spirit);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, blade)).toBe("graveyard");
    expect(keywords(game, spirit).has("indestructible")).toBe(true);
  });
});

describe("Keldon Overseer", () => {
  it("kicked, takes a creature until end of turn, untapped and hasty", () => {
    const { game, a } = table();
    lands(game, "Mountain", 7);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(a, bears);
    cast(game, toHand(game, "Keldon Overseer"), { kicked: true });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});
