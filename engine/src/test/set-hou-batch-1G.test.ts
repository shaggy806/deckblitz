import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  watchTargets,
  zone,
} from "./harness.js";

describe("Countervailing Winds", () => {
  it("asks {1} for each card in its caster's graveyard", () => {
    const { game, a } = table();
    for (let i = 0; i < 3; i++) toGraveyard(game, "Wastes");
    lands(game, "Island", 6);
    const thopter = toHand(game, "Ornithopter");
    cast(game, thopter, { settle: false });
    pickModes(a, 0);
    cast(game, toHand(game, "Countervailing Winds"), { targets: [ref(thopter)] });
    // Three Islands left pay the {3}.
    expect(zone(game, thopter)).toBe("battlefield");
  });

  it("counters when that's more than its controller can pay", () => {
    const { game, a } = table();
    for (let i = 0; i < 3; i++) toGraveyard(game, "Wastes");
    lands(game, "Island", 5);
    const thopter = toHand(game, "Ornithopter");
    cast(game, thopter, { settle: false });
    pickModes(a, 0);
    cast(game, toHand(game, "Countervailing Winds"), { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("graveyard");
  });
});

describe("Hour of Devastation", () => {
  it("strips indestructible and spares only Bolas planeswalkers", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const myr = spawn(game, "Darksteel Myr", B);
    const bolas = spawn(game, "Nicol Bolas, the Deceiver", B);
    const nissa = spawn(game, "Nissa, Genesis Mage", B);
    cast(game, toHand(game, "Hour of Devastation"));
    expect(zone(game, myr)).toBe("graveyard");
    expect(zone(game, nissa)).toBe("graveyard");
    expect(zone(game, bolas)).toBe("battlefield");
    expect(counters(game, bolas, "loyalty")).toBe(5);
  });
});

describe("Dreamstealer", () => {
  it("makes the player it hits discard as many cards as the damage", () => {
    const { game, a } = table();
    const stealer = spawn(game, "Dreamstealer");
    game.state.objects[stealer].counters["+1/+1"] = 2;
    const before = hand(game, B).length;
    attack(game, a, [stealer]);
    expect(life(game, B)).toBe(17);
    expect(hand(game, B).length).toBe(before - 3);
  });
});

describe("Hour of Eternity", () => {
  it("exiles X creature cards and makes a 4/4 black Zombie copy of each", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    cast(game, toHand(game, "Hour of Eternity"), { x: 2, targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    const copies = [...named(game, "Grizzly Bears", A), ...named(game, "Hill Giant", A)].filter(
      (id) => zone(game, id) === "battlefield",
    );
    expect(copies.length).toBe(2);
    for (const id of copies) {
      expect(pt(game, id)).toEqual({ power: 4, toughness: 4 });
      expect(subtypes(game, id)).toEqual(["Zombie"]);
    }
  });
});

describe("Tragic Lesson", () => {
  it("draws two, then returns a land instead of discarding", () => {
    const { game, a } = table();
    const [island] = lands(game, "Island", 3);
    const lesson = toHand(game, "Tragic Lesson");
    const before = hand(game).length;
    pickModes(a, 1);
    pickPermanents(a, island);
    cast(game, lesson);
    // The Lesson left, two drawn, the Island back.
    expect(hand(game).length).toBe(before - 1 + 2 + 1);
    expect(zone(game, island)).toBe("hand");
    expect(graveyard(game)).toEqual([lesson]);
  });
});

describe("Earthshaker Khenra", () => {
  it("can target only a creature with power at most its own", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Earthshaker Khenra");
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(giant);
  });
});

describe("Imminent Doom", () => {
  it("fires on a spell of mana value equal to its doom counters, then counts up", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const doom = toHand(game, "Imminent Doom");
    cast(game, doom);
    expect(counters(game, doom, "doom")).toBe(1);
    lands(game, "Wastes", 4);
    pickTargets(a, B);
    cast(game, toHand(game, "Sol Ring"));
    expect(life(game, B)).toBe(19);
    expect(counters(game, doom, "doom")).toBe(2);
    // Mana value 1 no longer matches.
    cast(game, toHand(game, "Sol Ring"));
    expect(life(game, B)).toBe(19);
    cast(game, toHand(game, "Mind Stone"));
    expect(life(game, B)).toBe(17);
    expect(counters(game, doom, "doom")).toBe(3);
  });
});

describe("Wasp of the Bitter End", () => {
  it("may be sacrificed as you cast a Bolas planeswalker to destroy a creature", () => {
    const { game, a } = table();
    const wasp = spawn(game, "Wasp of the Bitter End");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 5);
    pickTargets(a, bears);
    pickModes(a, 0);
    cast(game, toHand(game, "Nicol Bolas, the Deceiver"));
    expect(zone(game, wasp)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Sifter Wurm", () => {
  it("gains life equal to the mana value of the card revealed after the scry", () => {
    const { game } = table();
    const top = toLibrary(game, "Hill Giant");
    enter(game, "Sifter Wurm");
    expect(zone(game, top)).toBe("library");
    expect(life(game, A)).toBe(24);
  });
});

describe("Oketra's Avenger", () => {
  it("exerted, takes no combat damage this turn", () => {
    const { game, a, b } = table();
    const avenger = spawn(game, "Oketra's Avenger");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: avenger }];
    pickModes(a, 0);
    attack(game, a, [avenger]);
    expect(zone(game, avenger)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Nissa, Genesis Mage", () => {
  it("+2 untaps up to two creatures and up to two lands", () => {
    const { game } = table();
    const nissa = spawn(game, "Nissa, Genesis Mage");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const elves = spawn(game, "Llanowar Elves", A, { tapped: true });
    const [f1, f2] = lands(game, "Forest", 2);
    game.state.objects[f1].tapped = true;
    game.state.objects[f2].tapped = true;
    loyalty(game, nissa, 2, { targets: [ref(bears), ref(elves), ref(f1), ref(f2)] });
    for (const id of [bears, elves, f1, f2]) expect(game.state.objects[id].tapped).toBe(false);
    expect(counters(game, nissa, "loyalty")).toBe(7);
  });
});

describe("Sidewinder Naga", () => {
  it("gets +1/+0 and trample with a Desert card in your graveyard", () => {
    const { game } = table();
    const naga = spawn(game, "Sidewinder Naga");
    expect(pt(game, naga)).toEqual({ power: 3, toughness: 2 });
    toGraveyard(game, "Abraded Bluffs");
    expect(pt(game, naga)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, naga).has("trample")).toBe(true);
  });
});

describe("Wall of Forgotten Pharaohs", () => {
  it("pings only while you control a Desert or have one in your graveyard", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Forgotten Pharaohs");
    const action = {
      type: "activate-ability",
      player: A,
      source: wall,
      abilityIndex: 0,
      targets: [ref(B)],
    } as const;
    expect(game.canDispatch(action)).not.toBeNull();
    spawn(game, "Abraded Bluffs");
    activate(game, wall, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });
});
