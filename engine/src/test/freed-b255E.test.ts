/**
 * Batch 255, group E: cards freed by the switch-pt, piles, hand-exile,
 * chosen-player and per-player-count families.
 */

import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

describe("Baleful Mastery", () => {
  it("for {1}{B}, an opponent of your choice draws, and the target is exiled", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    const [bob, carol] = [hand(game, B).length, hand(game, C).length];
    pickModes(a, 1);
    cast(game, toHand(game, "Baleful Mastery"), { targets: [ref(bears)], altCost: true });
    expect(zone(game, bears)).toBe("exile");
    expect([hand(game, B).length, hand(game, C).length]).toEqual([bob, carol + 1]);
  });

  it("a copy of it, with the {1}{B} cost paid, resolves as though it was paid (the ruling)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    lands(game, "Island", 2);
    const bob = hand(game, B).length;
    const mastery = toHand(game, "Baleful Mastery");
    cast(game, mastery, { targets: [ref(bears)], altCost: true, settle: false });
    cast(game, toHand(game, "Twincast"), { targets: [ref(mastery)] });
    expect(zone(game, bears)).toBe("exile");
    // The copy drew, then exiled the creature; the original fizzled with it gone.
    expect(hand(game, B).length).toBe(bob + 1);
  });

  it("for its mana cost, nobody draws", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    const bob = hand(game, B).length;
    cast(game, toHand(game, "Baleful Mastery"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(hand(game, B).length).toBe(bob);
  });
});

describe("Ertai Resurrected", () => {
  it("counters an activated ability, and its controller draws", () => {
    const { game, a } = table();
    nextTurn(game);
    const spirit = spawn(game, "Blinking Spirit", B);
    activate(game, spirit, 0, { player: B, settle: false });
    const bob = hand(game, B).length;
    pickModes(a, 0);
    a.chooseTargetsFn = (_view, _name, _specs, legal) => legal.map((slot) => slot[0]);
    enter(game, "Ertai Resurrected", A);
    expect(zone(game, spirit)).toBe("battlefield");
    expect(hand(game, B).length).toBe(bob + 1);
  });

  it("counters a spell, and its controller draws", () => {
    const { game, a } = table();
    nextTurn(game);
    lands(game, "Forest", 2, B);
    const bears = toHand(game, "Grizzly Bears", B);
    cast(game, bears, { player: B, settle: false });
    const bob = hand(game, B).length;
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Ertai Resurrected", A);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B).length).toBe(bob + 1);
  });

  it("destroys another creature, not itself, and its controller draws", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = hand(game, A).length;
    const bob = hand(game, B).length;
    // Nothing on the stack to counter, so the destroy mode is the only one offered.
    pickModes(a, 0);
    const seen = watchTargets(a, () => [bears]);
    const ertai = enter(game, "Ertai Resurrected", A);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, giant]));
    expect(seen.offered[0]).not.toContain(ertai);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(hand(game, B).length).toBe(bob + 1);
    expect(hand(game, A).length).toBe(mine);
  });

  it("can choose no mode", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    enter(game, "Ertai Resurrected", A);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Wandering Fumarole", () => {
  it("becomes a 1/4 blue and red Elemental that can switch for {0}", () => {
    const { game } = table();
    const land = spawn(game, "Wandering Fumarole", A);
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    activate(game, land, 1);
    expect(types(game, land)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, land)).toEqual({ power: 1, toughness: 4 });
    expect([...computeCharacteristics(game.state, registryOf(game), land).colors].sort()).toEqual(["R", "U"]);
    activate(game, land, 2);
    expect(pt(game, land)).toEqual({ power: 4, toughness: 1 });
    activate(game, land, 2);
    expect(pt(game, land)).toEqual({ power: 1, toughness: 4 });
    nextTurn(game);
    expect(types(game, land)).not.toContain("creature");
  });
});

describe("Strategic Betrayal", () => {
  it("the opponent exiles the creature they choose, and their graveyard", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const dead = toGraveyard(game, "Shock", B);
    const seen = pickPermanents(b, giant);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Strategic Betrayal"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([bears, giant]);
    expect([zone(game, bears), zone(game, giant), zone(game, dead)]).toEqual(["battlefield", "exile", "exile"]);
  });

  it("with no creature, they simply exile their graveyard (the ruling)", () => {
    const { game } = table();
    const dead = toGraveyard(game, "Shock", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Strategic Betrayal"), { targets: [ref(B)] });
    expect(zone(game, dead)).toBe("exile");
  });
});

describe("Epiphany at the Drownyard", () => {
  it("reveals X plus one, and the opponent's pile goes to hand", () => {
    const { game, a, b } = table();
    const low = toLibrary(game, "Island");
    const third = toLibrary(game, "Shock");
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Hill Giant");
    a.separatePilesFn = () => [[first], [second, third]];
    b.choosePileFn = () => 1;
    lands(game, "Island", 3);
    cast(game, toHand(game, "Epiphany at the Drownyard"), { x: 2 });
    expect([zone(game, first), zone(game, second), zone(game, third), zone(game, low)]).toEqual([
      "graveyard",
      "hand",
      "hand",
      "library",
    ]);
  });

  it("at X = 0 one card is revealed, and the opponent may choose the empty pile", () => {
    const { game, a, b } = table();
    const top = toLibrary(game, "Hill Giant");
    a.separatePilesFn = () => [[top], []];
    b.choosePileFn = () => 1;
    lands(game, "Island", 1);
    cast(game, toHand(game, "Epiphany at the Drownyard"), { x: 0 });
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Debt to the Kami", () => {
  it("the enchantment mode: the opponent exiles an enchantment of their choice", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const aluren = spawn(game, "Aluren", B);
    const seen = pickPermanents(b, aluren);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Debt to the Kami"), { modes: [1], targets: [ref(B)] });
    expect(seen.offered).toEqual([aluren]);
    expect([zone(game, bears), zone(game, aluren)]).toEqual(["battlefield", "exile"]);
  });

  it("the creature mode: the opponent exiles a creature of their choice", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const aluren = spawn(game, "Aluren", B);
    pickPermanents(b, bears);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Debt to the Kami"), { modes: [0], targets: [ref(B)] });
    expect([zone(game, bears), zone(game, aluren)]).toEqual(["exile", "battlefield"]);
  });
});

describe("Netherborn Phalanx", () => {
  it("each opponent loses life for the creatures they control, not yours", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", C);
    spawn(game, "Grizzly Bears", A);
    enter(game, "Netherborn Phalanx", A);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 18, 19]);
  });
});

describe("Chittering Rats", () => {
  it("the opponent puts a card of their choice on top of their library", () => {
    const { game, a, b } = table();
    const card = toHand(game, "Hill Giant", B);
    pickTargets(a, B);
    pickFromZone(b, card);
    enter(game, "Chittering Rats", A);
    expect(game.state.zones.perPlayer[B].library[0]).toBe(card);
  });
});

describe("Ruthless Negotiation", () => {
  it("from hand: they exile a card, and you draw nothing", () => {
    const { game, b } = table();
    const card = toHand(game, "Hill Giant", B);
    pickFromZone(b, card);
    lands(game, "Swamp", 1);
    const spell = toHand(game, "Ruthless Negotiation");
    const mine = hand(game).length;
    cast(game, spell, { targets: [ref(B)] });
    expect(zone(game, card)).toBe("exile");
    expect(hand(game).length).toBe(mine - 1);
  });

  it("with flashback: they exile a card and you draw", () => {
    const { game, b } = table();
    const card = toHand(game, "Hill Giant", B);
    pickFromZone(b, card);
    lands(game, "Swamp", 5);
    const spell = toGraveyard(game, "Ruthless Negotiation");
    const mine = hand(game).length;
    cast(game, spell, { targets: [ref(B)], via: "flashback" });
    expect(zone(game, card)).toBe("exile");
    expect(zone(game, spell)).toBe("exile");
    expect(hand(game).length).toBe(mine + 1);
  });
});

describe("Nimble Larcenist and Lifebane Zombie", () => {
  it("Larcenist: only artifact, instant and sorcery cards can be chosen", () => {
    const { game, a } = table();
    const ring = toHand(game, "Sol Ring", B);
    const shock = toHand(game, "Shock", B);
    const bears = toHand(game, "Grizzly Bears", B);
    pickTargets(a, B);
    const seen = pickFromZone(a, ring);
    enter(game, "Nimble Larcenist", A);
    expect(seen.offered).toEqual(expect.arrayContaining([ring, shock]));
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, ring)).toBe("exile");
  });

  it("Zombie: only green or white creature cards can be chosen", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    const lions = toHand(game, "Savannah Lions", B);
    const giant = toHand(game, "Hill Giant", B);
    const growth = toHand(game, "Giant Growth", B);
    pickTargets(a, B);
    const seen = pickFromZone(a, lions);
    enter(game, "Lifebane Zombie", A);
    expect([...seen.offered].sort()).toEqual([bears, lions].sort());
    expect(seen.offered).not.toContain(giant);
    expect(seen.offered).not.toContain(growth);
    expect(zone(game, lions)).toBe("exile");
  });
});

describe("Omen of Fire", () => {
  it("Islands go home, then each player sacrifices one per white permanent they control", () => {
    const { game } = table({ players: 3 });
    const islands = [spawn(game, "Island", A), spawn(game, "Island", B)];
    // Alice: two white permanents, so two of her four candidates.
    spawn(game, "Savannah Lions", A);
    spawn(game, "Savannah Lions", A);
    spawn(game, "Plains", A);
    spawn(game, "Plains", A);
    // Bob: one white permanent, so one of the two.
    spawn(game, "Savannah Lions", B);
    spawn(game, "Plains", B);
    // Carol: Plains but nothing white, so nothing.
    const carols = spawn(game, "Plains", C);
    const giant = spawn(game, "Hill Giant", A);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Omen of Fire"));
    for (const island of islands) expect(zone(game, island)).toBe("hand");
    expect(graveyard(game, A).length).toBe(3); // two sacrificed, and the spell
    expect(graveyard(game, B).length).toBe(1);
    expect(zone(game, carols)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Specter's Shriek", () => {
  const board = () => {
    const t = table();
    const shock = toHand(t.game, "Shock", B);
    const blade = toHand(t.game, "Doom Blade", B);
    lands(t.game, "Swamp", 1);
    const spell = toHand(t.game, "Specter's Shriek");
    return { ...t, shock, blade, spell, mine: hand(t.game).length };
  };

  it("a nonblack card chosen: that player exiles it, and you exile a card from your hand", () => {
    const { game, a, shock, spell, mine } = board();
    a.chooseFromZoneFn = (_view, eligible, min) => (eligible.includes(shock) ? [shock] : eligible.slice(0, min));
    cast(game, spell, { targets: [ref(B)] });
    expect(zone(game, shock)).toBe("exile");
    expect(hand(game).length).toBe(mine - 2);
  });

  it("a black card chosen: you exile nothing", () => {
    const { game, blade, spell, a, mine } = board();
    pickFromZone(a, blade);
    cast(game, spell, { targets: [ref(B)] });
    expect(zone(game, blade)).toBe("exile");
    expect(hand(game).length).toBe(mine - 1);
  });

  it("you may choose nothing", () => {
    const { game, shock, blade, spell, a, mine } = board();
    pickFromZone(a);
    cast(game, spell, { targets: [ref(B)] });
    expect([zone(game, shock), zone(game, blade)]).toEqual(["hand", "hand"]);
    expect(hand(game).length).toBe(mine - 1);
  });
});

describe("Psychic Theft", () => {
  it("not cast, the card goes back to its owner's hand at the next end step", () => {
    const { game, a } = table();
    const shock = toHand(game, "Shock", B);
    toHand(game, "Grizzly Bears", B);
    pickFromZone(a, shock);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Psychic Theft"), { targets: [ref(B)] });
    expect(zone(game, shock)).toBe("exile");
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, shock)).toBe("hand");
    expect(hand(game, B)).toContain(shock);
  });

  it("you may cast it while it's exiled, and it doesn't come back", () => {
    const { game, a } = table();
    const shock = toHand(game, "Shock", B);
    pickFromZone(a, shock);
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Psychic Theft"), { targets: [ref(B)] });
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "cast-spell" && o.card === shock);
    expect(offer).toBeDefined();
    pickTargets(a, B);
    cast(game, shock, { targets: [ref(B)], via: offer?.kind === "cast-spell" ? offer.via : undefined });
    expect(life(game, B)).toBe(18);
    expect(zone(game, shock)).toBe("graveyard");
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, shock)).toBe("graveyard");
  });
});

describe("Gloomlance", () => {
  it("a green creature: its controller discards", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    const bob = hand(game, B).length;
    cast(game, toHand(game, "Gloomlance"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B).length).toBe(bob - 1);
  });

  it("a red creature: nobody discards", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 5);
    const bob = hand(game, B).length;
    cast(game, toHand(game, "Gloomlance"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game, B).length).toBe(bob);
  });
});
