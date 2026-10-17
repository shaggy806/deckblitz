/**
 * Wilds of Eldraine (WOE/WOC), batch 1, group a (2026-10-17). Written on the
 * shared table in `harness.ts`, each test from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import { goadersOf } from "../goad.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
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
  tokensNamed,
  zone,
} from "./harness.js";

describe("Pollen-Shield Hare // Hare Raising", () => {
  it("Pollen-Shield Hare pumps creature tokens you control only", () => {
    const { game } = table();
    spawn(game, "Pollen-Shield Hare");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Knight Token", count: 1 });
    game.debugApplyEffect(B, { kind: "create-token", token: "Knight Token", count: 1 });
    settle(game);
    const [mine] = named(game, "Knight Token", A);
    const [theirs] = named(game, "Knight Token", B);
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Hare Raising gives vigilance and +X/+X, X the creatures you control, then goes on an adventure", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    const hare = toHand(game, "Pollen-Shield Hare");
    cast(game, hare, { face: 1, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(zone(game, hare)).toBe("exile");
    expect(game.state.objects[hare].onAdventure).toBe(true);
  });
});

describe("Redcap Gutter-Dweller", () => {
  it("enters with two Rats that can't block", () => {
    const { game } = table();
    enter(game, "Redcap Gutter-Dweller");
    expect(tokensNamed(game, "Rat Token (Can't Block)", A)).toBe(2);
  });

  it("at upkeep may sacrifice another creature: a counter, and the top card exiled and playable this turn", () => {
    const { game, a } = table();
    const redcap = spawn(game, "Redcap Gutter-Dweller");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      // "Another" creature: the Redcap itself isn't offered.
      expect(eligible).not.toContain(redcap);
      return [bears];
    };
    const bolt = toLibrary(game, "Lightning Bolt");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, redcap)).toBe(1);
    expect(zone(game, bolt)).toBe("exile");
    const playable = game
      .legalActions(A)
      .some((x) => x.kind === "cast-spell" && "card" in x && x.card === bolt);
    expect(playable).toBe(true);
  });

  it("declining sacrifices nothing and exiles nothing", () => {
    const { game, a } = table();
    const redcap = spawn(game, "Redcap Gutter-Dweller");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    const bolt = toLibrary(game, "Lightning Bolt");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, redcap)).toBe(0);
    expect(zone(game, bolt)).toBe("library");
  });
});

describe("Talion's Messenger", () => {
  it("attacking with a Faerie loots, then the discard puts a +1/+1 counter on a target Faerie", () => {
    const { game, a } = table();
    const messenger = spawn(game, "Talion's Messenger");
    toHand(game, "Wastes");
    pickTargets(a, messenger);
    const before = hand(game).length;
    attack(game, a, [messenger]);
    expect(hand(game).length).toBe(before);
    expect(counters(game, messenger)).toBe(1);
  });

  it("attacking with no Faerie does nothing", () => {
    const { game, a } = table();
    spawn(game, "Talion's Messenger");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    const gy = graveyard(game).length;
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(gy);
  });
});

describe("Rat Out", () => {
  it("with no target, just makes the Rat", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Rat Out"), { targets: [null] });
    expect(tokensNamed(game, "Rat Token (Can't Block)", A)).toBe(1);
  });

  it("with its one target gone, does nothing — no Rat (its ruling)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Rat Out"), { targets: [ref(bears)], settle: false });
    destroy(game, bears);
    expect(tokensNamed(game, "Rat Token (Can't Block)", A)).toBe(0);
  });
});

describe("Woodland Acolyte // Mend the Wilds", () => {
  it("Mend the Wilds puts a permanent card, not an instant, from your graveyard on top of your library", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    expect(() => cast(game, toHand(game, "Woodland Acolyte"), { face: 1, targets: [ref(bolt)] })).toThrow();
    const acolyte = toHand(game, "Woodland Acolyte");
    cast(game, acolyte, { face: 1, targets: [ref(bears)] });
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bears);
    expect(zone(game, acolyte)).toBe("exile");
  });
});

describe("Twining Twins // Swift Spiral", () => {
  it("Swift Spiral exiles a nontoken creature and returns it to its owner at the next end step", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Knight Token", count: 1 });
    settle(game);
    const [knight] = named(game, "Knight Token", B);
    lands(game, "Plains", 4);
    expect(() => cast(game, toHand(game, "Twining Twins"), { face: 1, targets: [ref(knight)] })).toThrow();
    cast(game, toHand(game, "Twining Twins"), { face: 1, targets: [ref(bears)] });
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    toStep(game, "cleanup");
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});

describe("Provisions Merchant", () => {
  it("attacking, a sacrificed Food gives attacking creatures +1/+1 and trample", () => {
    const { game, a } = table();
    const merchant = enter(game, "Provisions Merchant");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    const idle = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [merchant, bears]);
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
    expect(pt(game, merchant)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(pt(game, idle)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, idle).has("trample")).toBe(false);
    expect(life(game, B)).toBe(13);
  });
});

describe("Snaremaster Sprite", () => {
  it("paying {2} taps an opponent's creature and stuns it", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 2);
    pickModes(a, 0);
    pickTargets(a, giant);
    enter(game, "Snaremaster Sprite");
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(counters(game, giant, "stun")).toBe(1);
  });

  it("not paying does nothing", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 2);
    pickModes(a);
    pickTargets(a, giant);
    enter(game, "Snaremaster Sprite");
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(counters(game, giant, "stun")).toBe(0);
  });
});

describe("Wildwood Mentor", () => {
  it("grows from any token entering, and pumps another attacker by its power", () => {
    const { game, a } = table();
    const mentor = spawn(game, "Wildwood Mentor");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 });
    settle(game);
    expect(counters(game, mentor)).toBe(1);
    pickTargets(a, bears);
    attack(game, a, [mentor, bears]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(life(game, B)).toBe(14);
  });
});

describe("Malevolent Witchkite", () => {
  it("sacrifices any number of your artifacts, enchantments and tokens, then draws that many", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const anthem = spawn(game, "Glorious Anthem");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Glorious Anthem", B);
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 });
    settle(game);
    const [food] = named(game, "Food Token", A);
    const seen = pickPermanents(a, anthem, food);
    const before = hand(game).length;
    enter(game, "Malevolent Witchkite");
    expect([...seen.offered].sort()).toEqual([ring, anthem, food].sort());
    expect(zone(game, anthem)).toBe("graveyard");
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("A Tale for the Ages", () => {
  it("pumps only enchanted creatures you control", () => {
    const { game } = table();
    spawn(game, "A Tale for the Ages");
    const bears = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(theirs)] });
    // Holy Strength's +1/+2, and the Tale's +2/+2.
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 6 });
    expect(pt(game, plain)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Barrow Naughty", () => {
  it("has lifelink only while you control another Faerie", () => {
    const { game } = table();
    const naughty = spawn(game, "Barrow Naughty");
    expect(keywords(game, naughty).has("lifelink")).toBe(false);
    spawn(game, "Barrow Naughty", B);
    expect(keywords(game, naughty).has("lifelink")).toBe(false);
    spawn(game, "Snaremaster Sprite");
    expect(keywords(game, naughty).has("lifelink")).toBe(true);
  });
});

describe("Taken by Nightmares", () => {
  it("exiles the creature, and scries 2 only if you control an enchantment", () => {
    const { game, a } = table();
    let scries = 0;
    a.chooseScryFn = () => {
      scries += 1;
      return [];
    };
    lands(game, "Swamp", 8);
    const first = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Taken by Nightmares"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("exile");
    expect(scries).toBe(0);
    spawn(game, "Glorious Anthem");
    const second = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Taken by Nightmares"), { targets: [ref(second)] });
    expect(zone(game, second)).toBe("exile");
    expect(scries).toBe(1);
  });
});

describe("Territorial Witchstalker", () => {
  it("with a power-4 creature, gets +1/+0 and attacks despite defender", () => {
    const { game, a } = table();
    const witch = spawn(game, "Territorial Witchstalker");
    spawn(game, "Serra Angel");
    attack(game, a, [witch]);
    expect(pt(game, witch)).toEqual({ power: 3, toughness: 3 });
    expect(life(game, B)).toBe(17);
  });

  it("without one, the trigger does nothing", () => {
    const { game } = table();
    const witch = spawn(game, "Territorial Witchstalker");
    spawn(game, "Hill Giant");
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, witch)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Dutiful Griffin", () => {
  it("returns from the graveyard to hand by sacrificing two enchantments", () => {
    const { game } = table();
    const griffin = toGraveyard(game, "Dutiful Griffin");
    const one = spawn(game, "Glorious Anthem");
    const two = spawn(game, "A Tale for the Ages");
    lands(game, "Plains", 3);
    activate(game, griffin, 0);
    expect(zone(game, griffin)).toBe("hand");
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
  });
});

describe("Nettling Nuisance", () => {
  it("a Faerie's combat damage makes that player a 4/2 Pirate goaded by you for the game", () => {
    const { game, a } = table();
    const nuisance = spawn(game, "Nettling Nuisance");
    attack(game, a, [nuisance]);
    expect(life(game, B)).toBe(17);
    const [pirate] = named(game, "Pirate Token (Nettling Nuisance)", B);
    expect(pirate).toBeDefined();
    expect(pt(game, pirate)).toEqual({ power: 4, toughness: 2 });
    expect(goadersOf(game.state, registryOf(game), pirate)).toEqual([A]);
    expect(tokensNamed(game, "Pirate Token (Nettling Nuisance)", A)).toBe(0);
  });
});

describe("Savior of the Sleeping", () => {
  it("grows when an enchantment you control goes to a graveyard, not an opponent's", () => {
    const { game } = table();
    const savior = spawn(game, "Savior of the Sleeping");
    const mine = spawn(game, "Glorious Anthem");
    const theirs = spawn(game, "Glorious Anthem", B);
    destroy(game, theirs);
    expect(counters(game, savior)).toBe(0);
    destroy(game, mine);
    expect(counters(game, savior)).toBe(1);
  });
});
