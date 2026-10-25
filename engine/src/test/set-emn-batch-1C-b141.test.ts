/**
 * Set walk, Conspiracy: Take the Crown and Eldritch Moon, group C. One test
 * per clause most likely to be wrong: Splitting Slime's counterless copy,
 * Noosegraf Mob's counter-for-a-Zombie, Deploy the Gatewatch's planeswalker
 * pick, Lunar Force's sacrifice-and-counter, Soul Separator's two tokens,
 * Extricator of Sin's sacrifice, the transforms of Grizzled Angler and Curious
 * Homunculus, Haunted Dead's return, Geist-Fueled Scarecrow's tax, Coveted
 * Peacock's goad and Blessed Alliance's escalate and attacking-only sacrifice.
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
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
  tokensNamed,
  zone,
  nextTurn,
} from "./harness.js";

describe("Splitting Slime", () => {
  it("becoming monstrous makes a token copy with no counters", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const slime = spawn(game, "Splitting Slime");
    activate(game, slime, 0);
    expect(counters(game, slime)).toBe(3);
    expect(pt(game, slime)).toEqual({ power: 6, toughness: 6 });
    const copies = named(game, "Splitting Slime").filter((id) => game.state.objects[id].isToken);
    expect(copies).toHaveLength(1);
    expect(pt(game, copies[0])).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Noosegraf Mob", () => {
  it("enters with five counters; a spell cast trades one for a 2/2 Zombie", () => {
    const { game } = table();
    const mob = enter(game, "Noosegraf Mob");
    expect(counters(game, mob)).toBe(5);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, mob)).toBe(4);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Deploy the Gatewatch", () => {
  it("puts a planeswalker from the top seven onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const bears = toLibrary(game, "Grizzly Bears");
    const ajani = toLibrary(game, "Ajani, Mentor of Heroes");
    const seen = pickFromZone(a, ajani);
    cast(game, toHand(game, "Deploy the Gatewatch"));
    expect(seen.offered).toEqual([ajani]);
    expect(zone(game, ajani)).toBe("battlefield");
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Lunar Force", () => {
  it("counters an opponent's spell and is sacrificed", () => {
    const { game } = table();
    const force = spawn(game, "Lunar Force");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const shock = toHand(game, "Shock", B);
    cast(game, shock, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    expect(zone(game, shock)).toBe("graveyard");
    expect(zone(game, force)).toBe("graveyard");
  });
});

describe("Soul Separator", () => {
  it("makes a 1/1 flying Spirit copy and a Zombie the card's size", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    const separator = spawn(game, "Soul Separator");
    const spider = toGraveyard(game, "Giant Spider");
    activate(game, separator, 0, { targets: [ref(spider)] });
    expect(zone(game, spider)).toBe("exile");
    expect(zone(game, separator)).toBe("graveyard");
    const copy = named(game, "Giant Spider").find((id) => game.state.objects[id].isToken);
    expect(copy).toBeDefined();
    expect(pt(game, copy!)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, copy!).has("flying")).toBe(true);
    expect(keywords(game, copy!).has("reach")).toBe(true);
    expect(subtypes(game, copy!)).toEqual(expect.arrayContaining(["Spider", "Spirit"]));
    const [zombie] = named(game, "Zombie Token (Black 0/0)");
    expect(pt(game, zombie)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Extricator of Sin // Extricator of Flesh", () => {
  it("may sacrifice another permanent for a 3/2 Eldrazi Horror", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickPermanents(a, bears);
    const extricator = enter(game, "Extricator of Sin");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, extricator)).toBe("battlefield");
    expect(tokensNamed(game, "Eldrazi Horror Token", A)).toBe(1);
  });
});

describe("Grizzled Angler // Grisly Anglerfish", () => {
  it("transforms once a colorless creature card is in the graveyard", () => {
    const { game } = table();
    const angler = spawn(game, "Grizzled Angler");
    toLibrary(game, "Ornithopter");
    activate(game, angler, 0);
    expect(printedCardName(game.state.objects[angler])).toBe("Grisly Anglerfish");
  });

  it("stays a Human with no colorless creature card milled", () => {
    const { game } = table();
    const angler = spawn(game, "Grizzled Angler");
    activate(game, angler, 0);
    expect(printedCardName(game.state.objects[angler])).toBe("Grizzled Angler");
  });
});

describe("Curious Homunculus // Voracious Reader", () => {
  it("transforms at upkeep with three instant and sorcery cards in the graveyard", () => {
    const { game } = table();
    const homunculus = spawn(game, "Curious Homunculus");
    toGraveyard(game, "Opt");
    toGraveyard(game, "Shock");
    toGraveyard(game, "Lightning Bolt");
    toStep(game, "upkeep");
    settle(game);
    expect(printedCardName(game.state.objects[homunculus])).toBe("Voracious Reader");
  });

  it("doesn't with two", () => {
    const { game } = table();
    const homunculus = spawn(game, "Curious Homunculus");
    toGraveyard(game, "Opt");
    toGraveyard(game, "Shock");
    toStep(game, "upkeep");
    settle(game);
    expect(printedCardName(game.state.objects[homunculus])).toBe("Curious Homunculus");
  });
});

describe("Haunted Dead", () => {
  it("returns from the graveyard tapped for {1}{B} and two discards, making a Spirit", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const dead = toGraveyard(game, "Haunted Dead");
    const before = hand(game).length;
    activate(game, dead, 0);
    expect(zone(game, dead)).toBe("battlefield");
    expect(game.state.objects[dead].tapped).toBe(true);
    expect(hand(game).length).toBe(before - 2);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });
});

describe("Geist-Fueled Scarecrow", () => {
  it("makes your creature spells cost {1} more", () => {
    const { game } = table();
    spawn(game, "Geist-Fueled Scarecrow");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    expect(() => cast(game, bears)).toThrow();
    lands(game, "Forest", 1);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Coveted Peacock", () => {
  it("may goad a creature the defending player controls as it attacks", () => {
    const { game, a } = table();
    const peacock = spawn(game, "Coveted Peacock");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [peacock]);
    expect(game.state.objects[bears].goadedBy).toEqual([A]);
  });
});

describe("Blessed Alliance", () => {
  it("pays {2} per extra mode: life and untapping", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const first = spawn(game, "Grizzly Bears", A, { tapped: true });
    const second = spawn(game, "Hill Giant", A, { tapped: true });
    cast(game, toHand(game, "Blessed Alliance"), { modes: [0, 1], targets: [ref(A), ref(first), ref(second)] });
    expect(life(game, A)).toBe(24);
    expect(game.state.objects[first].tapped).toBe(false);
    expect(game.state.objects[second].tapped).toBe(false);
  });

  it("the opponent sacrifices an attacking creature, not one at home", () => {
    const { game, b } = table();
    lands(game, "Plains", 2);
    const alliance = toHand(game, "Blessed Alliance");
    nextTurn(game);
    const attacker = spawn(game, "Grizzly Bears", B);
    const home = spawn(game, "Hill Giant", B);
    b.declareAttackersFn = () => [{ attacker, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
    cast(game, alliance, { modes: [2], targets: [ref(B)] });
    expect(zone(game, attacker)).toBe("graveyard");
    expect(zone(game, home)).toBe("battlefield");
  });
});
