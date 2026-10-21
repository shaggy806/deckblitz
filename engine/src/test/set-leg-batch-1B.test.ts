import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  D,
  activate,
  cast,
  counters,
  destroy,
  enter,
  grant,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

describe("Pendelhaven", () => {
  it("pumps a 1/1 and can't target anything else", () => {
    const { game } = table();
    const haven = spawn(game, "Pendelhaven");
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, haven, 1, { targets: [ref(bears)] })).toThrow();
    activate(game, haven, 1, { targets: [ref(elves)] });
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Hammerheim", () => {
  it("takes landwalk away until end of turn", () => {
    const { game } = table();
    const heim = spawn(game, "Hammerheim");
    const bears = spawn(game, "Grizzly Bears", B);
    grant(game, bears, "swampwalk");
    expect(keywords(game, bears).has("swampwalk")).toBe(true);
    activate(game, heim, 1, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("swampwalk")).toBe(false);
  });
});

describe("Kismet", () => {
  it("taps opponents' artifacts, creatures and lands as they enter, not yours", () => {
    const { game } = table();
    spawn(game, "Kismet");
    const theirBears = enter(game, "Grizzly Bears", B);
    const theirForest = enter(game, "Forest", B);
    const theirRing = enter(game, "Sol Ring", B);
    const mine = enter(game, "Grizzly Bears", A);
    expect(game.state.objects[theirBears].tapped).toBe(true);
    expect(game.state.objects[theirForest].tapped).toBe(true);
    expect(game.state.objects[theirRing].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("Syphon Soul", () => {
  it("deals 2 to each other player and gains the total", () => {
    const { game } = table({ players: 4 });
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Syphon Soul"));
    expect([life(game, B), life(game, C), life(game, D)]).toEqual([18, 18, 18]);
    expect(life(game, A)).toBe(26);
  });
});

describe("Heaven's Gate", () => {
  it("turns each target creature white", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Heaven's Gate"), { targets: [ref(one), ref(two)] });
    for (const id of [one, two]) {
      expect([...computeCharacteristics(game.state, game.registry, id).colors]).toEqual(["W"]);
    }
  });
});

describe("Blood Lust", () => {
  it("gives a small creature -X where X is its toughness minus 1, fixed as it resolves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Blood Lust"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 1 });
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 0, toughness: 3, duration: "end-of-turn" }, [
      ref(bears),
    ]);
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 4 });
  });

  it("gives a creature with toughness 5 or greater +4/-4", () => {
    const { game } = table();
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Blood Lust"), { targets: [ref(dreadmaw)] });
    expect(pt(game, dreadmaw)).toEqual({ power: 10, toughness: 2 });
  });
});

describe("Alabaster Potion", () => {
  it("gives target player X life", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    game.state.players[B].life = 10;
    cast(game, toHand(game, "Alabaster Potion"), { x: 3, modes: [0], targets: [ref(B)] });
    expect(life(game, B)).toBe(13);
  });

  it("prevents the next X damage to any target", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Alabaster Potion"), { x: 2, modes: [1], targets: [ref(bears)] });
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(bears)]);
    settle(game);
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });
});

describe("Hazezon Tamar", () => {
  it("makes one Sand Warrior per land at your next upkeep, and exiles every Sand Warrior as it leaves", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const hazezon = enter(game, "Hazezon Tamar");
    expect(tokensNamed(game, "Sand Warrior Token", A)).toBe(0);
    lands(game, "Wastes", 1); // counted as the delayed trigger resolves
    toStep(game, "draw");
    expect(tokensNamed(game, "Sand Warrior Token", A)).toBe(4);
    const warrior = spawn(game, "Warrior Token");
    destroy(game, hazezon);
    expect(tokensNamed(game, "Sand Warrior Token", A)).toBe(0);
    expect(zone(game, warrior)).toBe("battlefield"); // a Warrior, not a Sand
  });
});

describe("Angelic Voices", () => {
  it("pumps while every creature you control is white or an artifact", () => {
    const { game } = table();
    spawn(game, "Angelic Voices");
    const lions = spawn(game, "Savannah Lions");
    spawn(game, "Ornithopter");
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 2 });
    spawn(game, "Grizzly Bears", B); // an opponent's doesn't count
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 2 });
    spawn(game, "Grizzly Bears");
    expect(pt(game, lions)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Remove Enchantments", () => {
  it("returns what you own, destroys the rest on your side, and leaves the opponent's own", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const theirBears = spawn(game, "Grizzly Bears", B);
    const kismet = spawn(game, "Kismet");
    const holy = spawn(game, "Holy Strength");
    game.state.objects[holy].attachedTo = bears;
    const pacifism = spawn(game, "Pacifism", B);
    game.state.objects[pacifism].attachedTo = bears;
    const theirAura = spawn(game, "Unholy Strength", B);
    game.state.objects[theirAura].attachedTo = theirBears;
    const before = hand(game).length;
    cast(game, toHand(game, "Remove Enchantments"));
    expect(zone(game, kismet)).toBe("hand");
    expect(zone(game, holy)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, pacifism)).toBe("graveyard");
    expect(zone(game, theirAura)).toBe("battlefield");
  });
});

describe("Primordial Ooze", () => {
  it("grows each upkeep; unpaid, it taps and deals X damage to you", () => {
    const { game, a } = table({ step: "end" });
    const ooze = spawn(game, "Primordial Ooze");
    game.state.objects[ooze].counters["+1/+1"] = 2;
    pickModes(a); // don't pay
    toStep(game, "draw");
    expect(counters(game, ooze)).toBe(3);
    expect(game.state.objects[ooze].tapped).toBe(true);
    expect(life(game, A)).toBe(17);
  });
});

describe("Ring of Immortals", () => {
  it("counters an Aura spell that targets a permanent you control, not one aimed elsewhere", () => {
    const { game } = table();
    const ring = spawn(game, "Ring of Immortals");
    lands(game, "Plains", 6);
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears");
    const theirBears = spawn(game, "Grizzly Bears", B);
    const atTheirs = toHand(game, "Pacifism");
    cast(game, atTheirs, { targets: [ref(theirBears)], settle: false });
    expect(() => activate(game, ring, 0, { targets: [ref(atTheirs)], settle: false })).toThrow();
    settle(game);
    const atMine = toHand(game, "Pacifism");
    cast(game, atMine, { targets: [ref(bears)], settle: false });
    activate(game, ring, 0, { targets: [ref(atMine)] });
    expect(zone(game, atMine)).toBe("graveyard");
    expect(zone(game, atTheirs)).toBe("battlefield");
  });
});
