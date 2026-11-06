/**
 * Star Trek (TRK) — the rest of the set, group A: the conditions, choices,
 * delayed triggers and Sagas of batch 267.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const pool = (game: Game, player: PlayerId = A): string[] =>
  game.state.players[player].manaPool.map((unit) => unit.type).sort();

const canPlay = (game: Game, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some((x) => (x.kind === "cast-spell" || x.kind === "play-land") && x.card === card);

describe('Dr. Leonard "Bones" McCoy', () => {
  it("returns a non-Doctor permanent card, and doesn't offer a Doctor", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const physician = toGraveyard(game, "Photosynthetic Physician");
    pickModes(a, 0);
    const seen = watchTargets(a, (offered) => offered.map((slot) => slot[0] ?? null));
    enter(game, 'Dr. Leonard "Bones" McCoy');
    if (seen.asked > 0) expect(seen.offered[0]).not.toContain(physician);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, physician)).toBe("graveyard");
  });

  it("offers no return with only a Doctor in the graveyard", () => {
    const { game, a } = table();
    const physician = toGraveyard(game, "Photosynthetic Physician");
    let offered = 0;
    a.chooseModesFn = (_view, _min, max) => {
      offered = max;
      return [0];
    };
    enter(game, 'Dr. Leonard "Bones" McCoy');
    expect(offered).toBe(1);
    expect(zone(game, physician)).toBe("graveyard");
  });

  it("returns the chosen creature that dies this turn at the next end step, with a +1/+1 counter", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    // Both modes are offered; the second is index 1.
    pickModes(a, 1);
    pickTargets(a, bears);
    enter(game, 'Dr. Leonard "Bones" McCoy');
    destroy(game, bears);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    toStep(game, "end");
    settle(game);
    const back = named(game, "Grizzly Bears");
    expect(back).toHaveLength(1);
    expect(counters(game, back[0])).toBe(1);
  });
});

describe("Jake Sisko, War Correspondent", () => {
  it("gains 1 life on each landfall and investigates only on the second", () => {
    const { game } = table();
    enter(game, "Jake Sisko, War Correspondent");
    const before = life(game);
    enter(game, "Forest");
    expect(life(game)).toBe(before + 1);
    expect(tokensNamed(game, "Clue Token")).toBe(0);
    enter(game, "Forest");
    expect(life(game)).toBe(before + 2);
    expect(tokensNamed(game, "Clue Token")).toBe(1);
  });
});

describe("Worf, Honor-Bound Warrior", () => {
  it("doubles his power when you attack with total power 8 or greater", () => {
    const { game, a } = table();
    const worf = spawn(game, "Worf, Honor-Bound Warrior");
    spawn(game, "Craw Wurm");
    spawn(game, "Grizzly Bears");
    attack(game, a, [worf]);
    expect(pt(game, worf).power).toBe(2);
    expect(life(game, B)).toBe(18);
  });

  it("doesn't below total power 8", () => {
    const { game, a } = table();
    const worf = spawn(game, "Worf, Honor-Bound Warrior");
    spawn(game, "Grizzly Bears");
    attack(game, a, [worf]);
    expect(pt(game, worf).power).toBe(1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Constable Odo", () => {
  it("taps an opponent's creature and puts two stun counters on it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Constable Odo");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(2);
  });

  it("investigates twice", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    enter(game, "Constable Odo");
    expect(tokensNamed(game, "Clue Token")).toBe(2);
  });
});

describe("Academy Instructor", () => {
  it("makes Officers on noncreature spells and counts only Officer tokens", () => {
    const { game } = table();
    const instructor = spawn(game, "Academy Instructor");
    lands(game, "Island", 6);
    cast(game, toHand(game, "Divination"));
    cast(game, toHand(game, "Divination"));
    expect(tokensNamed(game, "Officer Token")).toBe(2);
    spawn(game, "Cantankerous Captain");
    expect(pt(game, instructor)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Rok-Tahk, Budding Scientist", () => {
  it("makes Murf, and gives creatures you control {T}: Add {G}{G}", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Rok-Tahk, Budding Scientist");
    const murf = named(game, "Murf Token");
    expect(murf).toHaveLength(1);
    expect(supertypes(game, murf[0])).toContain("legendary");
    activate(game, bears, 0);
    expect(pool(game)).toEqual(["G", "G"]);
  });
});

describe("Warp Speed", () => {
  it("finds a Planet card, makes lands enter untapped, and costs {X} less per differently named land", () => {
    const { game, a } = table();
    const bajor = toLibrary(game, "Bajor");
    pickFromZone(a, bajor);
    const warp = enter(game, "Warp Speed");
    expect(zone(game, bajor)).toBe("hand");
    game.dispatch({ type: "play-land", player: A, card: bajor });
    settle(game);
    expect(game.state.objects[bajor].tapped).toBe(false);
    spawn(game, "Andoria");
    spawn(game, "Cardassia Prime");
    lands(game, "Island", 2);
    const before = hand(game).length;
    activate(game, warp, 0);
    expect(hand(game)).toHaveLength(before + 2);
    expect(zone(game, warp)).toBe("graveyard");
  });
});

describe("Gray and Adira, Forever Joined", () => {
  it("copies a creature, not legendary and hasty, after a noncreature spell, and sacrifices it", () => {
    const { game, a } = table();
    const gray = spawn(game, "Gray and Adira, Forever Joined");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    pickTargets(a, gray);
    toStep(game, "begin-combat");
    settle(game);
    const copies = named(game, "Gray and Adira, Forever Joined").filter((id) => game.state.objects[id].isToken);
    expect(copies).toHaveLength(1);
    expect(zone(game, gray)).toBe("battlefield");
    expect(supertypes(game, copies[0])).not.toContain("legendary");
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Gray and Adira, Forever Joined")).toEqual([gray]);
  });

  it("does nothing without a noncreature spell this turn", () => {
    const { game, a } = table();
    const gray = spawn(game, "Gray and Adira, Forever Joined");
    pickTargets(a, gray);
    toStep(game, "begin-combat");
    settle(game);
    expect(named(game, "Gray and Adira, Forever Joined")).toEqual([gray]);
  });
});

describe("The Inner Light", () => {
  it("returns a green creature card, then draws as many cards as the chosen creature deals a player", () => {
    const { game, a } = table();
    const elves = toGraveyard(game, "Llanowar Elves");
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, elves);
    enter(game, "The Inner Light");
    expect(zone(game, elves)).toBe("battlefield");
    pickTargets(a, giant);
    toStep(game, "precombat-main");
    settle(game);
    const before = hand(game).length;
    attack(game, a, [giant]);
    expect(hand(game)).toHaveLength(before + 3);
  });
});

describe("The Measure of a Man", () => {
  it("exiles a nontoken creature, investigates, then returns it and gains 2 life", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "The Measure of a Man");
    expect(zone(game, giant)).toBe("exile");
    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, "Clue Token")).toBe(1);
    const before = life(game);
    toStep(game, "precombat-main");
    settle(game);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
    expect(life(game)).toBe(before + 2);
  });
});

describe("In the Pale Moonlight", () => {
  it("edicts a nontoken creature, investigates, then trades an artifact for two Romulans", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "In the Pale Moonlight");
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "precombat-main");
    settle(game);
    const clue = named(game, "Clue Token", A);
    expect(clue).toHaveLength(1);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [clue[0]];
    toStep(game, "precombat-main");
    settle(game);
    expect(named(game, "Clue Token", A)).toHaveLength(0);
    expect(tokensNamed(game, "Romulan Token", A)).toBe(2);
  });
});

describe("The Naked Time", () => {
  it("chapter II pumps and hastes creatures entering that turn; chapter III sacrifices a land", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    enter(game, "The Naked Time");
    toStep(game, "precombat-main");
    settle(game);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("haste")).toBe(true);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Vulcan Mind-Meld", () => {
  it("each player may play the cards they exiled, with mana of any type", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const forest = toLibrary(game, "Forest", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    spawn(game, "Mountain");
    lands(game, "Wastes", 2);
    spawn(game, "Mountain", B);
    cast(game, toHand(game, "Vulcan Mind-Meld"), { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    expect(canPlay(game, A, bears)).toBe(true);
    expect(canPlay(game, A, bolt)).toBe(false);
    expect(zone(game, forest)).toBe("exile");
    expect(canPlay(game, A, forest)).toBe(true);
    nextTurn(game);
    expect(canPlay(game, B, bolt)).toBe(true);
    expect(canPlay(game, B, bears)).toBe(false);
  });
});

describe("Dominion Infiltration", () => {
  it("copies X creatures your opponents control, with changeling and haste, and exiles them at end step", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Dominion Infiltration"), { x: 2, targets: [ref(bears), ref(giant)] });
    const copy = named(game, "Hill Giant", A);
    expect(copy).toHaveLength(1);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(keywords(game, copy[0]).has("changeling")).toBe(true);
    expect(keywords(game, copy[0]).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Hill Giant", A)).toHaveLength(0);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
  });
});

describe("Khaaaaaaaaaaaannn!", () => {
  it("deals twice X damage and exiles the creature it kills", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Khaaaaaaaaaaaannn!"), { x: 2, targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("exile");
  });
});

describe("Test of Identity", () => {
  it("pumps a Klingon with double strike, and can't target a non-Klingon", () => {
    const { game } = table();
    const targ = spawn(game, "Targ Wrangler");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    expect(() => cast(game, toHand(game, "Test of Identity"), { modes: [0], targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Test of Identity"), { modes: [0], targets: [ref(targ)] });
    expect(pt(game, targ)).toEqual({ power: 6, toughness: 4 });
    expect(keywords(game, targ).has("double-strike")).toBe(true);
  });

  it("discards a card to draw two", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const spell = toHand(game, "Test of Identity");
    const before = hand(game).length;
    cast(game, spell, { modes: [1] });
    expect(hand(game)).toHaveLength(before - 1 - 1 + 2);
  });
});

describe("Targ Wrangler", () => {
  it("sacrifices a nonland permanent at your end step only if it attacked", () => {
    const { game, a } = table();
    const targ = spawn(game, "Targ Wrangler");
    attack(game, a, [targ]);
    toStep(game, "end");
    settle(game);
    expect(zone(game, targ)).toBe("graveyard");
  });

  it("sacrifices nothing if it didn't attack", () => {
    const { game } = table();
    const targ = spawn(game, "Targ Wrangler");
    toStep(game, "end");
    settle(game);
    expect(zone(game, targ)).toBe("battlefield");
  });
});

describe("Cantankerous Captain", () => {
  it("grants menace when the +1/+0 brings total power to 8", () => {
    const { game, a } = table();
    spawn(game, "Cantankerous Captain");
    spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears).power).toBe(3);
    expect(keywords(game, bears).has("menace")).toBe(true);
  });

  it("only pumps below 8", () => {
    const { game, a } = table();
    spawn(game, "Cantankerous Captain");
    spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears).power).toBe(3);
    expect(keywords(game, bears).has("menace")).toBe(false);
  });
});

describe("Temporal Conqueror", () => {
  it("returns a land card from the graveyard", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Temporal Conqueror");
    expect(hand(game)).toHaveLength(before + 1);
    expect(tokensNamed(game, "Treasure Token")).toBe(0);
  });

  it("makes a Treasure when it can't", () => {
    const { game } = table({ deck: "Divination" });
    const before = hand(game).length;
    enter(game, "Temporal Conqueror");
    expect(hand(game)).toHaveLength(before);
    expect(tokensNamed(game, "Treasure Token")).toBe(1);
  });
});

describe("Sylvia Tilly, Joy of Discovery", () => {
  it("pays {1} and exiles a graveyard card to put a +1/+1 counter on a creature", () => {
    const { game, a } = table();
    const sylvia = spawn(game, "Sylvia Tilly, Joy of Discovery");
    lands(game, "Wastes", 1);
    const card = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    pickFromZone(a, card);
    pickTargets(a, sylvia);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(counters(game, sylvia)).toBe(1);
  });

  it("can't with an empty graveyard", () => {
    const { game, a } = table();
    const sylvia = spawn(game, "Sylvia Tilly, Joy of Discovery");
    lands(game, "Wastes", 1);
    pickModes(a, 0);
    pickTargets(a, sylvia);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, sylvia)).toBe(0);
  });
});

describe("Pah-Wraith", () => {
  it("pumps your creatures by the number of differently named lands as it attacks", () => {
    const { game, a } = table();
    const wraith = spawn(game, "Pah-Wraith");
    spawn(game, "Bajor");
    spawn(game, "Andoria");
    lands(game, "Forest", 2);
    attack(game, a, [wraith]);
    expect(life(game, B)).toBe(13);
  });
});

describe("Temporal Anomaly", () => {
  it("mills four, offers only the permanent cards, and makes a tapped New Planet", () => {
    const { game, a } = table();
    const divination = toLibrary(game, "Divination");
    const anomaly = spawn(game, "Temporal Anomaly");
    lands(game, "Forest", 4);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible.slice(0, 1);
    };
    const before = hand(game).length;
    activate(game, anomaly, 1);
    expect(zone(game, divination)).toBe("graveyard");
    expect(offered).toHaveLength(3);
    expect(offered).not.toContain(divination);
    expect(hand(game)).toHaveLength(before + 1);
    const planet = named(game, "New Planet Token");
    expect(planet).toHaveLength(1);
    expect(game.state.objects[planet[0]].tapped).toBe(true);
  });
});

describe("Cleveland Booker, Empath", () => {
  it("makes a 2/2 Worm that can't block on landfall", () => {
    const { game } = table();
    enter(game, "Cleveland Booker, Empath");
    enter(game, "Forest");
    expect(tokensNamed(game, "2/2 Red Green Worm Token")).toBe(1);
  });
});
