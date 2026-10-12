/**
 * Batch 64, part e (2026-10-12): the behold cards — Lorwyn Eclipsed's
 * "behold an Elf or pay {2}" creatures and Champions, Tarkir: Dragonstorm's
 * Exhales and Sarkhan, the Jace and Gamma cards — unblocked by the behold
 * keyword action (rule 701.4 — `behold.test.ts` has the mechanic's own
 * tests). Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

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
  tokensNamed,
  zone,
} from "./harness.js";

const manaOf = (game: Game, type: string, player: PlayerId = A): number =>
  game.state.players[player].manaPool.filter((u) => u.type === type).length;

const revealedFromHand = (game: Game): ObjectId[] =>
  game.state.eventLog.flatMap((e) => (e.type === "cards-revealed" && e.from === "hand" ? [...e.objects] : []));

describe("Lys Alana Dignitary", () => {
  it("{T}: Add {G}{G} only with an Elf card in your graveyard", () => {
    const { game } = table();
    const dignitary = spawn(game, "Lys Alana Dignitary");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: dignitary, abilityIndex: 0, targets: [] })).not.toBeNull();
    toGraveyard(game, "Llanowar Elves");
    activate(game, dignitary);
    expect(manaOf(game, "G")).toBe(2);
  });
});

describe("Silvergill Mentor", () => {
  it("beholds a Merfolk for {1}{U}, and its token is a 1/1 white and blue Merfolk", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const merfolk = toHand(game, "Silvergill Mentor");
    toHand(game, "Silvergill Mentor");
    cast(game, merfolk, { costOption: 0 });
    expect(zone(game, merfolk)).toBe("battlefield");
    expect(revealedFromHand(game)).toHaveLength(1);
    const [token] = named(game, "Merfolk Token (Silvergill Mentor)");
    expect(token).toBeDefined();
    expect([...game.characteristics(token).colors].sort()).toEqual(["U", "W"]);
    expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Soulbright Seeker", () => {
  it("grants trample, and the third resolution in a turn adds {R}{R}{R}{R}", () => {
    const { game } = table();
    const seeker = spawn(game, "Soulbright Seeker");
    lands(game, "Mountain", 4);
    for (let i = 1; i <= 4; i += 1) {
      activate(game, seeker, 0, { targets: [ref(seeker)] });
      // Spent before the next activation, so the pool counts only the bonus.
      if (i === 3) {
        expect(manaOf(game, "R")).toBe(4);
        game.state.players[A].manaPool = [];
      } else expect(manaOf(game, "R")).toBe(0);
    }
    expect(keywords(game, seeker).has("trample")).toBe(true);
  });
});

describe("Mudbutton Cursetosser", () => {
  it("can't block, and dying destroys an opponent's creature with power 2 or less", () => {
    const { game, a } = table();
    const tosser = spawn(game, "Mudbutton Cursetosser");
    expect(game.characteristics(tosser).restrictions).toContain("cant-block");
    const small = spawn(game, "Grizzly Bears", B);
    pickTargets(a, small);
    destroy(game, tosser);
    expect(zone(game, small)).toBe("graveyard");
  });
});

describe("Kinsbaile Aspirant", () => {
  it("gets +1/+1 until end of turn whenever another creature you control enters", () => {
    const { game } = table();
    const aspirant = spawn(game, "Kinsbaile Aspirant");
    enter(game, "Grizzly Bears");
    expect(pt(game, aspirant)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Countersculpt", () => {
  it("beholds a Jace token on the battlefield, counters the spell and empowers that Jace", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    // A Jace token from an earlier empower.
    game.debugApplyEffect(A, { kind: "empower-jace", amount: 1 }, []);
    settle(game);
    const [jace] = named(game, "Jace Token");
    expect(counters(game, jace, "loyalty")).toBe(1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Countersculpt"), { targets: [ref(shock)], costOption: 0 });
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(counters(game, jace, "loyalty")).toBe(2);
  });
});

describe("Caustic Exhale", () => {
  it("paying {1} instead: -3/-3 until end of turn", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const dragon = spawn(game, "Shivan Dragon", B);
    cast(game, toHand(game, "Caustic Exhale"), { targets: [ref(dragon)], costOption: 1 });
    expect(pt(game, dragon)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Piercing Exhale", () => {
  it("bites, and surveils 2 only if a Dragon was beheld", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const dragon = spawn(game, "Shivan Dragon");
    const theirs = spawn(game, "Grizzly Bears", B);
    const surveils = () =>
      game.state.eventLog.filter((e) => e.type === "scried" && e.mode === "surveil" && e.looked === 2).length;
    cast(game, toHand(game, "Piercing Exhale"), { targets: [ref(dragon), ref(theirs)], kicked: true });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(surveils()).toBe(1);
    const other = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Piercing Exhale"), { targets: [ref(dragon), ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
    expect(surveils()).toBe(1);
  });
});

describe("Hulk's Thunderclap", () => {
  it("beholding a Gamma creature adds a target: a noncreature artifact or enchantment, destroyed", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const relic = spawn(game, "Cryogen Relic", B);
    const thunderclap = toHand(game, "Hulk's Thunderclap");
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === thunderclap && x.kicked === true)).toBe(false);
    // A Gamma creature card isn't in the pool to reveal, so a Bears plays one.
    game.debugApplyEffect(A, { kind: "add-types", target: 0, addSubtypes: ["Gamma"], duration: "end-of-turn" }, [ref(bears)]);
    settle(game);
    cast(game, thunderclap, { targets: [ref(bears), ref(theirs), ref(relic)], kicked: true });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, relic)).toBe("graveyard");
  });

  it("unbeheld, just the bite — and the second creature is another than the first", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const thunderclap = toHand(game, "Hulk's Thunderclap");
    cast(game, thunderclap, { targets: [ref(bears), ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Hyperion's Atomic Vision", () => {
  it("destroys a tapped creature; scries 2 only if a Hero was beheld", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const vision = toHand(game, "Hyperion's Atomic Vision");
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === vision && x.kicked === true)).toBe(false);
    cast(game, vision, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
  });
});

describe("Champion of the Path", () => {
  it("another Elemental entering deals damage equal to its power to each opponent", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Champion of the Path");
    enter(game, "Air Elemental");
    expect(life(game, B)).toBe(16);
    expect(life(game, "carol" as PlayerId)).toBe(16);
    expect(life(game)).toBe(20);
  });

  it("cast beholding an Elemental card: exiled, and back to the hand when the Champion leaves", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const air = toHand(game, "Air Elemental");
    const champion = toHand(game, "Champion of the Path");
    cast(game, champion);
    expect(zone(game, air)).toBe("exile");
    destroy(game, champion);
    expect(zone(game, air)).toBe("hand");
  });
});

describe("Champion of the Weird", () => {
  it("is a 5/5 Goblin cast by exiling a Goblin you control", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const goblin = spawn(game, "Goblin Chieftain");
    const champion = toHand(game, "Champion of the Weird");
    cast(game, champion);
    expect(zone(game, goblin)).toBe("exile");
    expect(pt(game, champion)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Champions of the Shoal", () => {
  it("entering taps up to one target creature and stuns it; becoming tapped does it again", () => {
    const { game, a } = table();
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Shivan Dragon", B);
    pickTargets(a, first);
    const champion = enter(game, "Champions of the Shoal");
    expect(game.state.objects[first].tapped).toBe(true);
    expect(counters(game, first, "stun")).toBe(1);
    pickTargets(a, second);
    attack(game, a, [champion]);
    expect(game.state.objects[second].tapped).toBe(true);
    expect(counters(game, second, "stun")).toBe(1);
  });

  it("up to one: choosing none does nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, null);
    enter(game, "Champions of the Shoal");
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Champion of the Clachan", () => {
  it("has flash, and other Kithkin you control get +1/+1", () => {
    const { game } = table();
    const champion = spawn(game, "Champion of the Clachan");
    const kithkin = spawn(game, "Amrou Kithkin");
    const theirs = spawn(game, "Amrou Kithkin", B);
    expect(keywords(game, champion).has("flash")).toBe(true);
    expect(pt(game, kithkin)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, champion)).toEqual({ power: 4, toughness: 5 });
  });
});

describe("Champions of the Perfect", () => {
  it("draws a card whenever you cast a creature spell", () => {
    const { game } = table();
    spawn(game, "Champions of the Perfect");
    lands(game, "Forest", 2);
    toLibrary(game, "Forest");
    const bears = toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, bears);
    expect(hand(game).length).toBe(before);
  });
});

describe("Sarkhan, Dragon Ascendant", () => {
  it("with a Dragon in hand and one on the battlefield, asks which, then makes a Treasure", () => {
    const { game, a } = table();
    toHand(game, "Shivan Dragon");
    const onBoard = spawn(game, "Shivan Dragon");
    pickModes(a, 0);
    const seen = pickFromZone(a, onBoard);
    enter(game, "Sarkhan, Dragon Ascendant");
    expect(seen.offered).toHaveLength(2);
    expect(revealedFromHand(game)).toEqual([]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("becomes a flying Dragon until end of turn as a Dragon enters", () => {
    const { game } = table();
    const sarkhan = spawn(game, "Sarkhan, Dragon Ascendant");
    enter(game, "Shivan Dragon");
    expect(game.characteristics(sarkhan).subtypes).toContain("Dragon");
    expect(keywords(game, sarkhan).has("flying")).toBe(true);
    expect(counters(game, sarkhan)).toBe(1);
  });
});

describe("Theorist's Sanctum", () => {
  it("{2}{U}, {T}: Empower Jace 2", () => {
    const { game } = table();
    const sanctum = spawn(game, "Theorist's Sanctum");
    game.state.objects[sanctum].tapped = false;
    lands(game, "Island", 3);
    activate(game, sanctum, 1);
    const [jace] = named(game, "Jace Token");
    expect(counters(game, jace, "loyalty")).toBe(2);
  });
});

describe("Kindle the Inner Flame", () => {
  it("copies a creature you control with haste, sacrificed at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Kindle the Inner Flame"), { targets: [ref(bears)] });
    const copies = named(game, "Grizzly Bears").filter((id) => id !== bears);
    expect(copies).toHaveLength(1);
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Kindle the Inner Flame")).toBe(true);
  });
});
