/**
 * Innistrad: Midnight Hunt, group e. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  attack,
  cast,
  controller,
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
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const face = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const setDayNight = (game: Game, value: "day" | "night"): void => {
  game.debugApplyEffect(A, { kind: "day-night", value });
  settle(game);
};

describe("Bladestitched Skaab", () => {
  it("gives other Zombies you control +1/+0, not itself or an opponent's", () => {
    const { game } = table();
    const skaab = spawn(game, "Bladestitched Skaab");
    const corpse = spawn(game, "Walking Corpse");
    const theirs = spawn(game, "Walking Corpse", B);
    expect(pt(game, skaab)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, corpse)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Cathar's Call", () => {
  it("gives vigilance, and the enchanted creature's controller makes a Human at their end step", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Cathar's Call"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Human Token", A)).toBe(0);
    toStep(game, "end", B);
    settle(game);
    expect(tokensNamed(game, "Human Token", B)).toBe(1);
  });
});

describe("Smoldering Egg // Ashmouth Dragon", () => {
  it("counts the mana spent, and transforms at seven ember counters, removing them", () => {
    const { game, a } = table();
    lands(game, "Mountain", 7);
    const egg = spawn(game, "Smoldering Egg");
    pickTargets(a, B);
    cast(game, toHand(game, "Blaze"), { x: 4, targets: [ref(B)] });
    expect(counters(game, egg, "ember")).toBe(5);
    expect(face(game, egg)).toBe("Smoldering Egg");
    cast(game, toHand(game, "Blaze"), { x: 1, targets: [ref(B)] });
    expect(face(game, egg)).toBe("Ashmouth Dragon");
    expect(counters(game, egg, "ember")).toBe(0);
    expect(pt(game, egg)).toEqual({ power: 4, toughness: 4 });
  });

  it("the Dragon deals 2 damage to any target whenever you cast an instant or sorcery", () => {
    const { game, a } = table();
    lands(game, "Mountain", 7);
    const egg = spawn(game, "Smoldering Egg");
    pickTargets(a, B);
    cast(game, toHand(game, "Blaze"), { x: 6, targets: [ref(B)] });
    expect(face(game, egg)).toBe("Ashmouth Dragon");
    expect(life(game, B)).toBe(14);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14 - 3 - 2);
  });
});

describe("Village Watch // Village Reavers", () => {
  it("has haste by day; at night Wolves and Werewolves you control have haste", () => {
    const { game } = table();
    const watch = spawn(game, "Village Watch");
    expect(keywords(game, watch).has("haste")).toBe(true);
    const wolf = spawn(game, "Wolf Token", A, { sick: true });
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const theirWolf = spawn(game, "Wolf Token", B, { sick: true });
    expect(keywords(game, wolf).has("haste")).toBe(false);
    setDayNight(game, "day");
    setDayNight(game, "night");
    expect(face(game, watch)).toBe("Village Reavers");
    expect(keywords(game, watch).has("haste")).toBe(true);
    expect(keywords(game, wolf).has("haste")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(false);
    expect(keywords(game, theirWolf).has("haste")).toBe(false);
  });
});

describe("Sigarda, Champion of Light", () => {
  it("pumps Humans you control", () => {
    const { game } = table();
    spawn(game, "Sigarda, Champion of Light");
    const vanguard = spawn(game, "Elite Vanguard");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, vanguard)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("with coven, an attack looks at five and may take a Human creature card", () => {
    const { game, a } = table();
    const sigarda = spawn(game, "Sigarda, Champion of Light"); // 4
    spawn(game, "Memnite"); // 1
    spawn(game, "Hill Giant"); // 3
    const human = toLibrary(game, "Elite Vanguard");
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, human);
    attack(game, a, [sigarda]);
    expect(seen.offered).toEqual([human]);
    expect(zone(game, human)).toBe("hand");
  });

  it("without coven, the attack trigger does nothing", () => {
    const { game, a } = table();
    const sigarda = spawn(game, "Sigarda, Champion of Light"); // 4
    spawn(game, "Memnite"); // 1
    spawn(game, "Memnite"); // 1
    const human = toLibrary(game, "Elite Vanguard");
    pickFromZone(a, human);
    attack(game, a, [sigarda]);
    expect(zone(game, human)).toBe("library");
  });
});

describe("Flip the Switch", () => {
  it("counters a spell whose controller can't pay {4}, and makes a decayed Zombie", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    pickTargets(a, bears);
    cast(game, toHand(game, "Flip the Switch"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    const [zombie] = named(game, "Zombie Token (Crowded Crypt)");
    expect(zombie).toBeDefined();
    expect(keywords(game, zombie).has("decayed")).toBe(true);
  });
});

describe("Duel for Dominance", () => {
  it("with coven, a +1/+1 counter first, then the fight", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const mine = spawn(game, "Hill Giant"); // 3
    spawn(game, "Memnite"); // 1
    spawn(game, "Grizzly Bears"); // 2
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, mine, theirs);
    cast(game, toHand(game, "Duel for Dominance"), { targets: [ref(mine), ref(theirs)] });
    expect(counters(game, mine)).toBe(1);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(game.state.objects[mine].damageMarked).toBe(2);
  });

  it("without coven, no counter, but they still fight", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears, giant);
    cast(game, toHand(game, "Duel for Dominance"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("the counter still goes on when the other creature has become an illegal target", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Memnite");
    spawn(game, "Hill Giant");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears, giant);
    cast(game, toHand(game, "Duel for Dominance"), { targets: [ref(bears), ref(giant)], settle: false });
    destroy(game, giant);
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(game.state.objects[bears].damageMarked ?? 0).toBe(0);
  });
});

describe("Startle", () => {
  it("-2/-0, a decayed Zombie, and a card", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    const before = hand(game).length;
    pickTargets(a, giant);
    cast(game, toHand(game, "Startle"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });
    expect(tokensNamed(game, "Zombie Token (Crowded Crypt)", A)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Hobbling Zombie", () => {
  it("leaves a decayed Zombie behind when it dies", () => {
    const { game } = table();
    const zombie = spawn(game, "Hobbling Zombie");
    expect(keywords(game, zombie).has("deathtouch")).toBe(true);
    destroy(game, zombie);
    settle(game);
    expect(tokensNamed(game, "Zombie Token (Crowded Crypt)", A)).toBe(1);
  });
});

describe("Moonveil Regent", () => {
  it("may discard the hand to draw a card per color of the spell cast", () => {
    const { game, a } = table();
    spawn(game, "Moonveil Regent");
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    const skaab = toHand(game, "Bladestitched Skaab");
    const others = hand(game).length - 1;
    pickModes(a, 0);
    cast(game, skaab);
    expect(graveyard(game).length).toBe(others);
    expect(hand(game).length).toBe(2);
  });

  it("declined, nothing is discarded or drawn", () => {
    const { game, a } = table();
    spawn(game, "Moonveil Regent");
    lands(game, "Mountain", 1);
    const before = hand(game).length;
    pickTargets(a, B);
    pickModes(a);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(hand(game).length).toBe(before);
  });

  it("discarding an empty hand still draws (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Moonveil Regent");
    lands(game, "Mountain", 1);
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
    settle(game);
    expect(hand(game)).toHaveLength(0);
    const bolt = toHand(game, "Lightning Bolt");
    pickTargets(a, B);
    pickModes(a, 0);
    cast(game, bolt, { targets: [ref(B)] });
    expect(hand(game).length).toBe(1);
  });

  it("when it dies, deals X damage, X the colors among permanents you control then", () => {
    const { game, a } = table();
    const regent = spawn(game, "Moonveil Regent");
    spawn(game, "Grizzly Bears");
    spawn(game, "Bladestitched Skaab");
    pickTargets(a, B);
    destroy(game, regent);
    settle(game);
    expect(life(game, B)).toBe(17); // green, blue, black — not the Regent's red
  });
});

describe("Brutal Cathar // Moonrage Brute", () => {
  it("exiles on entering, keeps it exiled through night, exiles again on turning back, and returns them all on leaving", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, giant);
    const cathar = toHand(game, "Brutal Cathar");
    cast(game, cathar);
    expect(zone(game, giant)).toBe("exile");
    setDayNight(game, "night");
    expect(face(game, cathar)).toBe("Moonrage Brute");
    expect(zone(game, giant)).toBe("exile");
    pickTargets(a, bears);
    setDayNight(game, "day");
    expect(face(game, cathar)).toBe("Brutal Cathar");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, cathar);
    settle(game);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });

  it("Moonrage Brute has first strike and ward—pay 3 life", () => {
    const { game } = table();
    game.state.dayNight = "night";
    const brute = enter(game, "Brutal Cathar");
    expect(face(game, brute)).toBe("Moonrage Brute");
    expect(keywords(game, brute).has("first-strike")).toBe(true);
  });
});

describe("Grafted Identity", () => {
  it("costs a creature, steals the enchanted creature and gives it +1/+1", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const memnite = spawn(game, "Memnite");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    cast(game, toHand(game, "Grafted Identity"), { targets: [ref(giant)], sacrifice: memnite });
    expect(zone(game, memnite)).toBe("graveyard");
    expect(controller(game, giant)).toBe(A);
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("No Way Out", () => {
  it("target opponent discards two; you make a decayed Zombie", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Hill Giant", B);
    toHand(game, "Memnite", B);
    const before = hand(game, B).length;
    pickTargets(a, B);
    cast(game, toHand(game, "No Way Out"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
    expect(tokensNamed(game, "Zombie Token (Crowded Crypt)", A)).toBe(1);
  });
});

describe("Defend the Celestus", () => {
  it("distributes three +1/+1 counters as divided on casting", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    const memnite = spawn(game, "Memnite");
    cast(game, toHand(game, "Defend the Celestus"), { targets: [ref(bears), ref(memnite)], division: [2, 1] });
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, memnite)).toBe(1);
  });
});

describe("Morkrut Behemoth", () => {
  it("is offered for a sacrifice or for {1}{B} more", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    spawn(game, "Memnite");
    const behemoth = toHand(game, "Morkrut Behemoth");
    const offers = game
      .legalActions(A)
      .filter((x) => x.kind === "cast-spell" && x.card === behemoth)
      .map((o) => (o.kind === "cast-spell" ? o.costOptionText : null))
      .sort();
    expect(offers).toEqual(["Pay {1}{B}", "Sacrifice a creature"]);
  });

  it("paying {1}{B} more casts it without a sacrifice", () => {
    const { game } = table();
    const swamps = lands(game, "Swamp", 7);
    const memnite = spawn(game, "Memnite");
    const behemoth = toHand(game, "Morkrut Behemoth");
    cast(game, behemoth, { costOption: 1 });
    expect(zone(game, behemoth)).toBe("battlefield");
    expect(zone(game, memnite)).toBe("battlefield");
    expect(swamps.filter((id) => game.state.objects[id].tapped)).toHaveLength(7);
    expect(keywords(game, behemoth).has("menace")).toBe(true);
  });
});

describe("Sigardian Savior", () => {
  it("cast, it returns up to two small creature cards together", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const memnite = toGraveyard(game, "Memnite");
    toGraveyard(game, "Hill Giant");
    pickTargets(a, bears, memnite);
    cast(game, toHand(game, "Sigardian Savior"));
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(named(game, "Memnite", A)).toHaveLength(1);
  });

  it("not cast, it returns nothing", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears, null);
    enter(game, "Sigardian Savior");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("offers only creature cards with mana value 2 or less", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    let offered: readonly ObjectId[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      offered = legal[0].map((t) => (t.kind === "object" ? t.object : (t.player as unknown as ObjectId)));
      return [null, null];
    };
    cast(game, toHand(game, "Sigardian Savior"));
    expect(offered).toHaveLength(1);
    expect(offered).not.toContain(giant);
  });
});

describe("Rise of the Ants", () => {
  it("two 3/3 Insects and 2 life, and flashback from the graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 14);
    const ants = toHand(game, "Rise of the Ants");
    cast(game, ants);
    expect(tokensNamed(game, "Insect Token (Rise of the Ants)", A)).toBe(2);
    expect(life(game, A)).toBe(22);
    cast(game, ants, { via: "flashback" });
    expect(tokensNamed(game, "Insect Token (Rise of the Ants)", A)).toBe(4);
    expect(zone(game, ants)).toBe("exile");
  });
});

describe("Obsessive Astronomer", () => {
  it("makes it day as it enters, and a change discards up to two then draws that many", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Obsessive Astronomer"));
    expect(game.state.dayNight).toBe("day");
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    const kept = toHand(game, "Memnite");
    pickModes(a, 2);
    a.chooseDiscardsFn = () => [bears, giant];
    const before = hand(game).length;
    setDayNight(game, "night");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, kept)).toBe("hand");
    expect(hand(game).length).toBe(before);
  });

  it("may discard nothing", () => {
    const { game, a } = table();
    spawn(game, "Obsessive Astronomer");
    setDayNight(game, "day");
    toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    const before = hand(game).length;
    setDayNight(game, "night");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toHaveLength(0);
  });
});

describe("Olivia's Midnight Ambush", () => {
  it("-2/-2 by day, -13/-13 at night", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    setDayNight(game, "day");
    cast(game, toHand(game, "Olivia's Midnight Ambush"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    const other = spawn(game, "Hill Giant", B);
    setDayNight(game, "night");
    pickTargets(a, other);
    cast(game, toHand(game, "Olivia's Midnight Ambush"), { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
  });
});

describe("Celestus Sanctifier", () => {
  it("on a change, looks at two, keeps the chosen one on top and mills the other", () => {
    const { game, a } = table();
    spawn(game, "Celestus Sanctifier");
    setDayNight(game, "day");
    const second = toLibrary(game, "Hill Giant");
    const top = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, second);
    setDayNight(game, "night");
    expect(seen.offered).toEqual(expect.arrayContaining([top, second]));
    expect(library(game)[0]).toBe(second);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Leinore, Autumn Sovereign", () => {
  it("a counter on up to one creature, then a card if you have coven", () => {
    const { game, a } = table();
    spawn(game, "Leinore, Autumn Sovereign"); // 0
    const bears = spawn(game, "Grizzly Bears"); // 2
    spawn(game, "Grizzly Bears"); // 2
    pickTargets(a, bears);
    const before = hand(game).length;
    toStep(game, "postcombat-main");
    settle(game);
    // 0, 3, 2 — coven after the counter.
    expect(counters(game, bears)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });

  it("no coven, no card", () => {
    const { game, a } = table();
    spawn(game, "Leinore, Autumn Sovereign"); // 0
    const bears = spawn(game, "Grizzly Bears"); // 2
    pickTargets(a, bears);
    const before = hand(game).length;
    toStep(game, "postcombat-main");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(hand(game).length).toBe(before);
  });
});

describe("Shadow Kin", () => {
  it("mills each player three, may exile a creature card milled, and becomes a copy keeping the ability", () => {
    const { game, a } = table();
    const kin = spawn(game, "Shadow Kin");
    // Alice's next upkeep is turn 3; bob draws once before it, so his top
    // card then is the one under a Wastes.
    const giant = toLibrary(game, "Hill Giant", B);
    toLibrary(game, "Wastes", B);
    const memnite = toLibrary(game, "Memnite");
    const seen = pickFromZone(a, giant);
    toStep(game, "upkeep");
    settle(game);
    expect([...seen.offered].sort()).toEqual([giant, memnite].sort());
    expect(zone(game, giant)).toBe("exile");
    expect(printedCardName(game.state.objects[kin])).toBe("Hill Giant");
    expect(pt(game, kin)).toEqual({ power: 3, toughness: 3 });
    expect(graveyard(game, A)).toHaveLength(3);
    expect(graveyard(game, B)).toHaveLength(2);
    // It still has the ability: next upkeep, it can copy again.
    // (Alice draws the Wastes above it this turn.)
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    pickFromZone(a, bears);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(pt(game, kin)).toEqual({ power: 2, toughness: 2 });
  });
});
