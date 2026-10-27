/**
 * Prophecy (PCY; B222), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong: Noxious Field's
 * granted land ability, Rethink's mana-value tax, Mana Vapors' untap skip,
 * Living Terrain's animated land, the "no untapped lands" cycle (Vintara
 * Snapper, Spur Grappler, Keldon Berserker), Latulla's discard-two {X}
 * ability, Keldon Arsonist's two-land sacrifice, Bog Glider's Mercenary
 * search and Coffin Puppets' upkeep return.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  nextTurn,
  types,
  zone,
} from "./harness.js";

describe("Noxious Field", () => {
  it("gives the land '{T}: 1 damage to each creature and each player'", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const land = spawn(game, "Wastes");
    cast(game, toHand(game, "Noxious Field"), { targets: [ref(land)] });
    game.state.objects[land].tapped = false; // the auto-payer may have tapped it for the Aura
    const mine = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Llanowar Elves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = game
      .legalActions(A)
      .find((a) => a.kind === "activate-ability" && a.source === land && /damage/.test(a.text ?? ""));
    if (offer?.kind !== "activate-ability") throw new Error("granted ability not offered");
    game.dispatch({ type: "activate-ability", player: A, source: land, abilityIndex: offer.abilityIndex, targets: [] });
    settle(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Rethink", () => {
  it("counters unless its controller pays the spell's mana value", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickModes(a, 0);
    cast(game, toHand(game, "Rethink"), { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("the spell resolves when its {1} is paid", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickModes(a, 0);
    cast(game, toHand(game, "Rethink"), { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Mana Vapors", () => {
  it("keeps the target player's lands tapped through their next untap step", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const forest = spawn(game, "Forest", B, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Mana Vapors"), { targets: [ref(B)] });
    const later = spawn(game, "Forest", B, { tapped: true });
    nextTurn(game);
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(game.state.objects[later].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Living Terrain", () => {
  it("makes the enchanted land a 5/6 Treefolk creature that's still a land", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const land = spawn(game, "Wastes", B);
    cast(game, toHand(game, "Living Terrain"), { targets: [ref(land)] });
    expect(pt(game, land)).toEqual({ power: 5, toughness: 6 });
    expect(types(game, land)).toEqual(expect.arrayContaining(["creature", "land"]));
    expect(subtypes(game, land)).toContain("Treefolk");
  });
});

describe("Vintara Snapper and Spur Grappler", () => {
  it("have their bonus only while you control no untapped lands", () => {
    const { game } = table();
    const snapper = spawn(game, "Vintara Snapper");
    const grappler = spawn(game, "Spur Grappler");
    const land = spawn(game, "Forest");
    spawn(game, "Mountain", A, { tapped: true });
    expect(keywords(game, snapper).has("shroud")).toBe(false);
    expect(pt(game, grappler)).toEqual({ power: 2, toughness: 1 });
    game.state.objects[land].tapped = true;
    expect(keywords(game, snapper).has("shroud")).toBe(true);
    expect(pt(game, grappler)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Keldon Berserker", () => {
  it("gets +3/+0 attacking only if you control no untapped lands", () => {
    const { game, a } = table();
    const berserker = spawn(game, "Keldon Berserker");
    spawn(game, "Mountain", A, { tapped: true });
    attack(game, a, [berserker]);
    expect(life(game, B)).toBe(15);
  });

  it("with an untapped land, it attacks as a 2/3", () => {
    const { game, a } = table();
    const berserker = spawn(game, "Keldon Berserker");
    spawn(game, "Mountain");
    attack(game, a, [berserker]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Latulla, Keldon Overseer", () => {
  it("discards two cards and deals X damage", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const latulla = spawn(game, "Latulla, Keldon Overseer");
    const before = hand(game, A).length;
    activate(game, latulla, 0, { targets: [ref(B)], x: 2 });
    expect(hand(game, A)).toHaveLength(before - 2);
    expect(life(game, B)).toBe(18);
  });
});

describe("Keldon Arsonist", () => {
  it("sacrifices two lands to destroy target land", () => {
    const { game, a } = table();
    spawn(game, "Wastes");
    const [l1, l2] = lands(game, "Mountain", 2);
    const target = spawn(game, "Forest", B);
    a.chooseSacrificesFn = () => [l1, l2];
    const arsonist = spawn(game, "Keldon Arsonist");
    activate(game, arsonist, 0, { targets: [ref(target)] });
    expect(zone(game, l1)).toBe("graveyard");
    expect(zone(game, l2)).toBe("graveyard");
    expect(zone(game, target)).toBe("graveyard");
  });
});

describe("Bog Glider", () => {
  it("finds only a Mercenary permanent card of mana value 2 or less", () => {
    const { game, a } = table();
    const big = toLibrary(game, "Dauthi Mercenary");
    const small = toLibrary(game, "Goblin Turncoat");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible.slice(0, 1);
    };
    const glider = spawn(game, "Bog Glider");
    const land = spawn(game, "Swamp");
    game.dispatch({ type: "activate-ability", player: A, source: glider, abilityIndex: 0, targets: [], sacrifice: land });
    settle(game);
    expect(zone(game, land)).toBe("graveyard");
    expect(offered).toEqual([small]);
    expect(zone(game, small)).toBe("battlefield");
    expect(zone(game, big)).toBe("library");
  });
});

describe("Coffin Puppets", () => {
  it("returns from the graveyard in your upkeep, sacrificing two lands, even your last Swamp", () => {
    const { game, a } = table();
    const puppets = toGraveyard(game, "Coffin Puppets");
    const swamp = spawn(game, "Swamp");
    const wastes = spawn(game, "Wastes");
    a.chooseSacrificesFn = () => [swamp, wastes];
    expect(() => activate(game, puppets, 0)).toThrow();
    toStep(game, "upkeep");
    activate(game, puppets, 0);
    expect(zone(game, swamp)).toBe("graveyard");
    expect(zone(game, wastes)).toBe("graveyard");
    expect(zone(game, puppets)).toBe("battlefield");
  });

  it("can't be activated without a Swamp", () => {
    const { game } = table();
    const puppets = toGraveyard(game, "Coffin Puppets");
    lands(game, "Wastes", 2);
    toStep(game, "upkeep");
    expect(() => activate(game, puppets, 0)).toThrow();
  });
});
