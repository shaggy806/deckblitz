// Theme 16: keywords with costs as values a static can give a card or a spell,
// keyword abilities with a name a copy can read, and `doubleTriggers` by any
// cause. See docs/plans/need-key-themes.md, theme 16's design note.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
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
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const offersFor = (game: ReturnType<typeof table>["game"], card: string) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);

describe("granted replicate reads the granted cost (rule 702.56)", () => {
  it("Djinn Illuminatus: the replicate cost is the spell's mana cost", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Djinn Illuminatus");
    a.chooseTargetsFn = () => [ref(B)];
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], keywordCosts: { replicate: [2] } });
    expect(life(game, B)).toBe(11);
  });

  it("is offered only as far as the mana goes, and not for a creature spell", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Djinn Illuminatus");
    const bolt = toHand(game, "Lightning Bolt");
    const offered = offersFor(game, bolt).map((o) => (o.kind === "cast-spell" ? (o.keywordCosts?.replicate ?? [0])[0] : -1));
    expect(Math.max(...offered)).toBe(1);
    const bears = toHand(game, "Grizzly Bears");
    expect(offersFor(game, bears).some((o) => o.kind === "cast-spell" && o.keywordCosts !== undefined)).toBe(false);
  });

  it("sits beside a printed kicker, each its own additional cost", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    spawn(game, "Djinn Illuminatus");
    a.chooseTargetsFn = () => [ref(B)];
    cast(game, toHand(game, "Burst Lightning"), { targets: [ref(B)], kicked: true, keywordCosts: { replicate: [1] } });
    // Kicked for 4, and the copy of a kicked spell is kicked (rule 707.2).
    expect(life(game, B)).toBe(12);
  });

  it("two instances are paid separately (Hatchery Sliver cast with one in play)", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    spawn(game, "Hatchery Sliver");
    cast(game, toHand(game, "Hatchery Sliver"), { keywordCosts: { replicate: [1, 1] } });
    // The original, and one copy from each instance, each a token.
    expect(named(game, "Hatchery Sliver").length).toBe(4);
  });

  it("Hugh, First of Many: an artifact spell's copy becomes a token", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Plains", 1);
    spawn(game, "Hugh, First of Many");
    cast(game, toHand(game, "Sol Ring"), { keywordCosts: { replicate: [1] } });
    expect(tokensNamed(game, "Sol Ring")).toBe(1);
  });

  it("Threefold Signal: only a spell of exactly three colors", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Threefold Signal");
    const two = toHand(game, "Fire // Ice");
    expect(offersFor(game, two).some((o) => o.kind === "cast-spell" && o.keywordCosts !== undefined)).toBe(false);
  });

  it("Ian Chesterton: a Saga spell, and nothing else", () => {
    const { game } = table();
    lands(game, "Plains", 12);
    spawn(game, "Ian Chesterton");
    const saga = toHand(game, "Fall of the Thran");
    expect(offersFor(game, saga).some((o) => o.kind === "cast-spell" && o.keywordCosts?.replicate?.[0] === 1)).toBe(true);
    const bears = toHand(game, "Grizzly Bears");
    expect(offersFor(game, bears).some((o) => o.kind === "cast-spell" && o.keywordCosts !== undefined)).toBe(false);
  });

  it("ends when the grant does: the same cast is refused once Djinn has left", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const djinn = spawn(game, "Djinn Illuminatus");
    const bolt = toHand(game, "Lightning Bolt");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], keywordCosts: { replicate: [1] } })).toBeNull();
    destroy(game, djinn);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], keywordCosts: { replicate: [1] } })).not.toBeNull();
  });
});

describe("printed replicate with a cost that isn't mana", () => {
  it("Exterminate!: each copy taps another Dalek", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const dalek = game.debugSpawn("Dalek Token", A, "battlefield");
    const bears = spawn(game, "Grizzly Bears", B);
    const hill = spawn(game, "Hill Giant", B);
    a.chooseTargetsFn = () => [ref(hill)];
    const card = toHand(game, "Exterminate!");
    const offer = offersFor(game, card).find((o) => o.kind === "cast-spell" && o.keywordCosts?.replicate?.[0] === 1);
    expect(offer).toBeDefined();
    cast(game, card, { targets: [ref(bears)], keywordCosts: { replicate: [1] }, tap: [dalek] });
    expect(game.state.objects[dalek].tapped).toBe(true);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, hill)).toBe("graveyard");
    expect(life(game, B)).toBe(14);
  });

  it("Reiterating Bolt: {E}{E}{E} each time, and only as often as there's energy", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    game.state.players[A].energy = 4;
    const creature = spawn(game, "Colossal Dreadmaw", B);
    a.chooseTargetsFn = () => [ref(creature)];
    const card = toHand(game, "Reiterating Bolt");
    const most = Math.max(...offersFor(game, card).map((o) => (o.kind === "cast-spell" ? (o.keywordCosts?.replicate?.[0] ?? 0) : 0)));
    expect(most).toBe(1);
    cast(game, card, { targets: [ref(creature)], keywordCosts: { replicate: [1] } });
    expect(game.state.players[A].energy).toBe(1);
  });
});

describe("the other grants", () => {
  it("Herigast grants emerge at the spell's mana cost", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    spawn(game, "Herigast, Erupting Nullkite");
    const giant = spawn(game, "Hill Giant");
    const bears = toHand(game, "Grizzly Bears");
    // {1}{G} less the Giant's 4: generic only, so {G} is left (rule 702.119a).
    cast(game, bears, { via: "emerge", sacrifice: giant });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("a printed emerge and a granted one are each offered", () => {
    const { game } = table();
    lands(game, "Island", 6);
    spawn(game, "Herigast, Erupting Nullkite");
    spawn(game, "Hill Giant");
    const gryff = toHand(game, "Wretched Gryff");
    const costs = new Set(
      offersFor(game, gryff).flatMap((o) => (o.kind === "cast-spell" && o.via === "emerge" ? [o.emergeCost] : [])),
    );
    expect(costs).toEqual(new Set(["{5}{U}", "{7}"]));
  });

  it("Falkenrath Gorger gives a discarded Vampire madness, its cost its mana cost", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Falkenrath Gorger");
    const vampire = toHand(game, "Vampire Nighthawk");
    a.chooseDiscardsFn = () => [vampire];
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0]!;
      return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via };
    };
    lands(game, "Swamp", 1);
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, vampire)).toBe("battlefield");
  });

  it("a non-Vampire discarded beside the Gorger just goes to the graveyard", () => {
    const { game, a } = table();
    spawn(game, "Falkenrath Gorger");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(graveyard(game)).toContain(bears);
  });

  it("Grave Scrabbler's trigger needs its madness cost paid", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const scrabbler = toHand(game, "Grave Scrabbler");
    a.chooseDiscardsFn = () => [scrabbler];
    a.chooseTargetsFn = () => [ref(bears)];
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0]!;
      return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via };
    };
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, scrabbler)).toBe("battlefield");
    expect(hand(game)).toContain(bears);
  });

  it("Jandor makes a Mount with saddle 2, and a saddled attacker pays out", () => {
    const { game, a } = table();
    spawn(game, "Jandor, Fortuned Traveler");
    const wolf = spawn(game, "Ambush Wolf");
    expect(subtypes(game, wolf)).toContain("Mount");
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === wolf)).toBe(true);
    game.state.objects[wolf].saddled = true;
    const before = hand(game).length;
    attack(game, a, [wolf]);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Food Token")).toBe(1);
    expect(pt(game, wolf).power).toBe(game.registry.get("Ambush Wolf").power! + 2);
  });
});

describe("keyword abilities a copy can read (rule 707.9)", () => {
  it("Flesh Duplicate has vanishing 3 when what it copies doesn't have vanishing", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    a.chooseCopyFn = () => bears;
    const duplicate = toHand(game, "Flesh Duplicate");
    cast(game, duplicate);
    expect(pt(game, duplicate)).toEqual({ power: 2, toughness: 2 });
    expect(counters(game, duplicate, "time")).toBe(3);
    nextTurn(game, "precombat-main");
    nextTurn(game, "precombat-main");
    expect(counters(game, duplicate, "time")).toBe(2);
  });

  it("copying something with vanishing, it doesn't get a second one", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const calciderm = spawn(game, "Calciderm");
    game.state.objects[calciderm].counters.time = 2;
    a.chooseCopyFn = () => calciderm;
    const duplicate = toHand(game, "Flesh Duplicate");
    cast(game, duplicate);
    // Calciderm's own "vanishing 4": one replacement, no second from the Duplicate.
    expect(counters(game, duplicate, "time")).toBe(4);
  });

  it("Mirage Phalanx's token has haste and no soulbond", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.choosePermanentsFn = () => [bears];
    const phalanx = enter(game, "Mirage Phalanx");
    settle(game);
    expect(game.state.objects[phalanx].pairedWith).toBe(bears);
    nextTurn(game, "precombat-main");
    nextTurn(game, "begin-combat");
    settle(game);
    const token = named(game, "Mirage Phalanx").find((id) => id !== phalanx);
    expect(token).toBeDefined();
    expect(keywords(game, token!).has("haste")).toBe(true);
    // Its soulbond triggers are listed lost: a creature entering doesn't ask to pair.
    enter(game, "Hill Giant");
    expect(game.state.objects[token!].pairedWith).toBeUndefined();
  });
});

describe("doubleTriggers by any cause (rule 603.2)", () => {
  it("Hama Pashar: a room ability triggers an additional time", () => {
    const { game } = table();
    spawn(game, "Hama Pashar, Ruin Seeker");
    game.debugApplyEffect(A, { kind: "venture", into: "undercity" });
    settle(game);
    // Secret Entrance searches for a basic land; twice is the doubling.
    expect(game.state.eventLog.filter((e) => e.type === "library-searched" && e.player === A).length).toBe(2);
  });

  it("without Hama Pashar it triggers once", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "venture", into: "undercity" });
    settle(game);
    expect(game.state.eventLog.filter((e) => e.type === "library-searched" && e.player === A).length).toBe(1);
  });

  it("Wulfgar doubles his own melee: a creature you control attacking", () => {
    const { game, a } = table();
    const wulfgar = spawn(game, "Wulfgar of Icewind Dale");
    attack(game, a, [wulfgar]);
    settle(game);
    expect(pt(game, wulfgar).power).toBe(6);
  });

  it("Gandalf: a legendary permanent entering doubles it, a plain one doesn't", () => {
    const { game } = table();
    spawn(game, "Gandalf the White");
    spawn(game, "Soul Warden");
    const start = life(game, A);
    enter(game, "Hill Giant");
    settle(game);
    expect(life(game, A)).toBe(start + 1);
    enter(game, "Isamaru, Hound of Konda");
    settle(game);
    expect(life(game, A)).toBe(start + 3);
  });

  it("Gandalf: a legendary creature leaving doubles a dies trigger too", () => {
    const { game, a } = table();
    spawn(game, "Gandalf the White");
    spawn(game, "Blood Artist");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    a.chooseTargetsFn = () => [ref(B)];
    destroy(game, isamaru);
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("a `source` filter limits it to whose ability it is", () => {
    const registry = createDefaultRegistry().register(
      defineCard({
        name: "Test Doubler",
        manaCost: "{1}",
        colors: [],
        types: ["artifact"],
        text: "",
        static: [{ affects: { scope: "self" }, doubleTriggers: { cause: "enters", source: { type: "enchantment" } }, text: "" }],
      }),
    );
    const { game } = table({ registry });
    spawn(game, "Test Doubler");
    spawn(game, "Soul Warden");
    const start = life(game, A);
    enter(game, "Hill Giant");
    settle(game);
    // Soul Warden is a creature, so the doubler doesn't reach its ability.
    expect(life(game, A)).toBe(start + 1);
  });
});

describe("Panoptic Projektor", () => {
  it("the next face-down creature spell costs {3} less, and turning one up triggers twice", () => {
    const { game, a } = table();
    const lots = lands(game, "Forest", 2);
    const projektor = spawn(game, "Panoptic Projektor");
    const one = spawn(game, "Sol Ring", B);
    const two = spawn(game, "Mind Stone", B);
    activate(game, projektor);
    settle(game);
    const ainok = toHand(game, "Ainok Survivalist");
    // Face down is {3}, and the Projektor takes all of it.
    cast(game, ainok, { via: "face-down" });
    expect(lots.every((id) => !game.state.objects[id].tapped)).toBe(true);
    const picks = [[ref(one)], [ref(two)]];
    a.chooseTargetsFn = () => picks.shift() ?? [];
    game.dispatch({ type: "turn-face-up", player: A, permanent: ainok, morph: true });
    settle(game);
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
  });
});

describe("a doubler keyed on a theme-2 event row", () => {
  it("doubles what that event causes", () => {
    const registry = createDefaultRegistry().register(
      defineCard({
        name: "Test Surveil Doubler",
        manaCost: "{1}",
        colors: [],
        types: ["artifact"],
        text: "",
        static: [{ affects: { scope: "self" }, doubleTriggers: { cause: "surveils" }, text: "" }],
      }),
    );
    const { game } = table({ registry });
    spawn(game, "Test Surveil Doubler");
    const spybug = spawn(game, "Dimir Spybug");
    game.debugApplyEffect(A, { kind: "surveil", amount: 1 });
    settle(game);
    expect(counters(game, spybug)).toBe(2);
  });
});

describe("the old grant fields are gone", () => {
  it("no pool card uses a removed spelling", () => {
    const dir = join(__dirname, "..", "cards", "pool");
    const removed =
      /grants(Warp|Ninjutsu|Cycling|Foretell|Blitz)InHand|grants(Offspring|Evoke)ToSpells|grantsToHand:[^\n]*miracle: \{|keyword: "replicate", multi/;
    const hits = readdirSync(dir).filter((f) => f.endsWith(".ts") && removed.test(readFileSync(join(dir, f), "utf8")));
    expect(hits).toEqual([]);
  }, 60_000);
});
