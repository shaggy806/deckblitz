/** Batch 169, group D (Mirage): Kaervek's Purge's X filter and dies-this-way
 * damage, Ether Well's red-only bottom choice, Tranquil Domain's non-Aura
 * sweep, Telim'Tor's flanking pump, Goblin Elite Infantry's shrink, Dread
 * Specter's nonblack-only destroy, Pyric Salamander's delayed sacrifice,
 * Thirst's upkeep cost and Crypt Cobra's poison. */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  lands,
  life,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Kaervek's Purge", () => {
  it("destroys a creature of mana value X and deals its power to its controller", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Kaervek's Purge"), { targets: [ref(giant)], x: 4 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("can't target a creature of another mana value", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Kaervek's Purge"), { targets: [ref(bears)], x: 1 })).toThrow();
  });
});

describe("Ether Well", () => {
  it("may put a red creature on the bottom", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    pickModes(a, 0);
    const goblin = spawn(game, "Goblin Piker", B);
    cast(game, toHand(game, "Ether Well"), { targets: [ref(goblin)] });
    const library = game.state.zones.perPlayer[B].library;
    // Index 0 is the top.
    expect(library[library.length - 1]).toBe(goblin);
  });

  it("puts a nonred creature on top without asking", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ether Well"), { targets: [ref(bears)] });
    const library = game.state.zones.perPlayer[B].library;
    expect(library[0]).toBe(bears);
    expect(asked).toBe(0);
  });
});

describe("Tranquil Domain", () => {
  it("destroys non-Aura enchantments only", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const anthem = spawn(game, "Glorious Anthem", B);
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Bitter Chill"), { targets: [ref(bears)] });
    const chill = game.battlefield.find((id) => game.state.objects[id].cardName === "Bitter Chill")!;
    cast(game, toHand(game, "Tranquil Domain"));
    expect(zone(game, anthem)).toBe("graveyard");
    expect(zone(game, chill)).toBe("battlefield");
  });
});

describe("Telim'Tor", () => {
  it("pumps attacking creatures with flanking only", () => {
    const { game, a } = table();
    const telim = spawn(game, "Telim'Tor");
    const cavalry = spawn(game, "Benalish Cavalry");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [telim, cavalry, bears].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(pt(game, telim)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, cavalry)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Goblin Elite Infantry", () => {
  it("gets -1/-1 when it becomes blocked", () => {
    const { game, a, b } = table();
    const goblin = spawn(game, "Goblin Elite Infantry");
    const blocker = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker, attacker: goblin }];
    a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    toStep(game, "combat-damage");
    expect(pt(game, goblin)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Dread Specter", () => {
  it("destroys a nonblack blocker at end of combat, not a black one", () => {
    const { game, a, b } = table();
    const specter = spawn(game, "Dread Specter");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: specter }];
    attack(game, a, [specter]);
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("leaves a black blocker alone", () => {
    const { game, a, b } = table();
    const specter = spawn(game, "Dread Specter");
    const wall = spawn(game, "Wall of Bone", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: specter }];
    attack(game, a, [specter]);
    expect(zone(game, wall)).toBe("battlefield");
  });
});

describe("Pyric Salamander", () => {
  it("pumps and is sacrificed at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const salamander = spawn(game, "Pyric Salamander");
    activate(game, salamander);
    activate(game, salamander);
    expect(pt(game, salamander)).toEqual({ power: 3, toughness: 1 });
    toStep(game, "cleanup");
    expect(graveyard(game, A)).toContain(salamander);
  });
});

describe("Thirst", () => {
  it("taps the creature and is sacrificed at upkeep when {U} isn't paid", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Thirst"), { targets: [ref(bears)] });
    const thirst = game.battlefield.find((id) => game.state.objects[id].cardName === "Thirst")!;
    expect(game.state.objects[bears].tapped).toBe(true);
    for (const id of game.battlefield) if (game.state.objects[id].cardName === "Island") game.state.objects[id].tapped = true;
    a.chooseModesFn = () => [];
    toStep(game, "draw");
    expect(zone(game, thirst)).toBe("graveyard");
  });
});

describe("Crypt Cobra", () => {
  it("gives the defending player a poison counter when unblocked", () => {
    const { game, a } = table();
    const cobra = enter(game, "Crypt Cobra");
    attack(game, a, [cobra]);
    expect(game.state.players[B].counters?.poison ?? 0).toBe(1);
  });
});
