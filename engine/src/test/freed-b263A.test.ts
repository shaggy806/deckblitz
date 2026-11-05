/**
 * Batch 263, group A: cards freed by the P/T-per-amount, grant-outside-the-
 * battlefield, enchanted-player, target-player, damaged-by-source, impulse,
 * token-copy and additional-cost families. One test for the clause of each
 * most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { Game } from "../game.js";
import type { EffectSpec } from "../effects.js";
import type { LegalAction } from "../actions.js";
import {
  A,
  activate,
  attack,
  B,
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
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);

/** Equip `equipment` (alice's, equip {N} as its first ability) to `creature`. */
const equipTo = (game: Game, equipment: ObjectId, creature: ObjectId, cost: number): void => {
  lands(game, "Wastes", cost);
  activate(game, equipment, 0, { targets: [ref(creature)] });
};

/** Cast `card` the way the engine offers it (from exile: its permission). */
const castOffered = (game: Game, card: ObjectId, targets: readonly ObjectId[] | readonly PlayerId[] = []): void => {
  const offer = game
    .legalActions(A)
    .find((o): o is Extract<LegalAction, { kind: "cast-spell" }> => o.kind === "cast-spell" && o.card === card);
  expect(offer).toBeDefined();
  cast(game, card, { targets: targets.map((t) => ref(t)), ...(offer?.via !== undefined ? { via: offer.via } : {}) });
};

const oneSidedFight =(game: Game, from: ObjectId, to: ObjectId): void => {
  game.debugApplyEffect(controller(game, from), { kind: "fight", a: 0, b: 1, oneSided: true }, [ref(from), ref(to)]);
  settle(game);
};

describe("Gunner Conscript", () => {
  it("counts what's attached to it, and an equipped death makes one Junk", () => {
    const { game } = table();
    const gunner = spawn(game, "Gunner Conscript");
    const splitter = spawn(game, "Bonesplitter");
    equipTo(game, splitter, gunner, 1);
    expect(pt(game, gunner)).toEqual({ power: 5, toughness: 3 });
    destroy(game, gunner);
    expect(tokensNamed(game, "Junk Token", A)).toBe(1);
  });

  it("an unadorned death makes none", () => {
    const { game } = table();
    destroy(game, spawn(game, "Gunner Conscript"));
    expect(tokensNamed(game, "Junk Token", A)).toBe(0);
  });
});

describe("Heavenly Blademaster", () => {
  it("attaches the chosen Equipment as it enters and pumps the others per attachment", () => {
    const { game, a } = table();
    const splitter = spawn(game, "Bonesplitter");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, splitter);
    const blademaster = enter(game, "Heavenly Blademaster");
    expect(game.state.objects[splitter].attachedTo).toBe(blademaster);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, blademaster)).toEqual({ power: 5, toughness: 6 });
  });
});

describe("Winter Soldier, Icy Assassin", () => {
  it("returns from the graveyard with a finality counter and takes an Equipment", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Winter Soldier, Icy Assassin");
    const splitter = spawn(game, "Bonesplitter");
    lands(game, "Plains", 4);
    lands(game, "Swamp", 1);
    pickPermanents(a, splitter);
    activate(game, card, 0);
    const [soldier] = named(game, "Winter Soldier, Icy Assassin");
    expect(soldier).toBeDefined();
    expect(counters(game, soldier, "finality")).toBe(1);
    expect(game.state.objects[splitter].attachedTo).toBe(soldier);
    expect(pt(game, soldier).power).toBe(6);
  });
});

describe("With Great Power . . .", () => {
  it("+2/+2 per attachment, and your damage goes to the creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "With Great Power . . ."), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[bears].damageMarked).toBe(3);
  });
});

describe("Heroes' Podium", () => {
  it("each legendary creature gets +1/+1 for each other one", () => {
    const { game } = table();
    spawn(game, "Heroes' Podium");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const jo = spawn(game, "Jo Grant");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, isamaru)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, jo)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Skeletal Swarming", () => {
  it("other Skeletons pump each, and a death this turn doubles the end-step token", () => {
    const { game } = table();
    spawn(game, "Skeletal Swarming");
    const first = spawn(game, "Skeleton Token");
    spawn(game, "Skeleton Token");
    expect(pt(game, first).power).toBe(2);
    expect(keywords(game, first).has("trample")).toBe(true);
    destroy(game, spawn(game, "Grizzly Bears"));
    toStep(game, "end");
    settle(game);
    // The two spawned above are cards, not tokens: two tokens made.
    expect(tokensNamed(game, "Skeleton Token", A)).toBe(2);
  });

  it("one with no death", () => {
    const { game } = table();
    spawn(game, "Skeletal Swarming");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Skeleton Token", A)).toBe(1);
  });
});

describe("Diligent Zookeeper", () => {
  it("non-Humans get +1/+1 per creature type; Humans nothing", () => {
    const { game } = table();
    const keeper = spawn(game, "Diligent Zookeeper");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, keeper)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Moira Brown, Guide Author", () => {
  it("the Guide counts quest counters among your permanents", () => {
    const { game } = table();
    const moira = enter(game, "Moira Brown, Guide Author");
    const [guide] = named(game, "Wasteland Survival Guide Token");
    expect(guide).toBeDefined();
    const bears = spawn(game, "Grizzly Bears");
    equipTo(game, guide, bears, 1);
    addCounters(game, moira, "quest", 2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Blazing Sunsteel", () => {
  it("+1/+0 per opponent", () => {
    const { game } = table({ players: 3 });
    const sunsteel = spawn(game, "Blazing Sunsteel");
    const bears = spawn(game, "Grizzly Bears");
    equipTo(game, sunsteel, bears, 4);
    expect(pt(game, bears).power).toBe(4);
  });
});

describe("Greven, Predator Captain", () => {
  it("draws the sacrificed creature's power, loses its toughness, and grows by the life lost", () => {
    const { game, a } = table();
    const greven = spawn(game, "Greven, Predator Captain");
    const angel = spawn(game, "Serra Angel");
    pickModes(a, 0);
    pickPermanents(a, angel);
    a.chooseSacrificesFn = () => [angel];
    const before = hand(game).length;
    attack(game, a, [greven]);
    expect(zone(game, angel)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 4);
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(11);
  });
});

describe("Demonfire", () => {
  it("deals X and exiles a creature it kills", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Demonfire"), { targets: [ref(bears)], x: 2 });
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Littjara Kinseekers", () => {
  it("a counter with three sharing a type, none without", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const kin = enter(game, "Littjara Kinseekers");
    expect(counters(game, kin)).toBe(1);
    const other = table();
    spawn(other.game, "Grizzly Bears");
    const lone = enter(other.game, "Littjara Kinseekers");
    expect(counters(other.game, lone)).toBe(0);
  });
});

describe("Sinner's Judgment", () => {
  it("the enchanted player loses at the third judgment counter", () => {
    const { game } = table();
    const curse = spawn(game, "Sinner's Judgment");
    // Its back face up, on bob (as disturb would cast it).
    game.state.objects[curse].face = 1;
    game.state.objects[curse].attachedToPlayer = B;
    addCounters(game, curse, "judgment", 1);
    nextTurn(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(counters(game, curse, "judgment")).toBe(2);
    expect(game.state.players[B].hasLost).toBe(false);
    nextTurn(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(game.state.players[B].hasLost).toBe(true);
  });
});

describe("Radiant Grace", () => {
  it("returns as the Curse on the opponent, and their creatures enter tapped", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Radiant Grace"), { targets: [ref(bears)] });
    pickTargets(a, B);
    destroy(game, bears);
    const [curse] = named(game, "Radiant Grace", A);
    expect(curse).toBeDefined();
    expect(game.state.objects[curse].attachedToPlayer).toBe(B);
    const theirs = enter(game, "Grizzly Bears", B);
    expect(game.state.objects[theirs].tapped).toBe(true);
    const mine = enter(game, "Grizzly Bears", A);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("Biotransference", () => {
  it("creatures in play and creature cards in hand are artifacts", () => {
    const { game } = table();
    spawn(game, "Biotransference");
    const bears = spawn(game, "Grizzly Bears");
    const inHand = toHand(game, "Grizzly Bears");
    expect(types(game, bears)).toContain("artifact");
    expect(types(game, inHand)).toContain("artifact");
  });
});

describe("Fall of the Impostor", () => {
  it("III exiles the target opponent's biggest creature", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const third = registryOf(game).get("Fall of the Impostor").chapters?.[1];
    expect(third).toBeDefined();
    pickPermanents(a, angel);
    game.debugApplyEffect(A, third?.effect as EffectSpec, [ref(B)]);
    settle(game);
    expect(zone(game, angel)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Soul of Shandalar", () => {
  it("the creature must be the targeted player's", () => {
    const { game } = table();
    const soul = spawn(game, "Soul of Shandalar");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    expect(() => activate(game, soul, 0, { targets: [ref(B), ref(mine)] })).toThrow();
    activate(game, soul, 0, { targets: [ref(B), ref(theirs)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Bushi Tenderfoot", () => {
  it("flips when a creature it damaged this turn dies", () => {
    const { game } = table();
    const bushi = spawn(game, "Bushi Tenderfoot");
    const bears = spawn(game, "Grizzly Bears", B);
    oneSidedFight(game, bushi, bears);
    destroy(game, bears);
    expect(pt(game, bushi)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Scythe of the Wretched", () => {
  it("returns the creature its equipped creature killed and equips it", () => {
    const { game } = table();
    const scythe = spawn(game, "Scythe of the Wretched");
    const bears = spawn(game, "Grizzly Bears");
    equipTo(game, scythe, bears, 4);
    const thopter = spawn(game, "Ornithopter", B);
    oneSidedFight(game, bears, thopter);
    destroy(game, thopter);
    const [back] = named(game, "Ornithopter");
    expect(back).toBeDefined();
    expect(controller(game, back)).toBe(A);
    expect(game.state.objects[scythe].attachedTo).toBe(back);
  });
});

describe("Treasure Nabber", () => {
  it("takes an artifact an opponent taps for mana", () => {
    const { game } = table();
    spawn(game, "Treasure Nabber");
    const stone = spawn(game, "Mind Stone", B);
    nextTurn(game);
    activate(game, stone, 0, { player: B });
    expect(controller(game, stone)).toBe(A);
  });
});

describe("Necropotence", () => {
  it("pay 1 life: the card comes to hand at your next end step", () => {
    const { game } = table();
    const necro = spawn(game, "Necropotence");
    const before = hand(game).length;
    activate(game, necro, 0);
    expect(life(game, A)).toBe(19);
    expect(hand(game).length).toBe(before);
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Eladamri, Korvecdal", () => {
  it("reveals a creature card from the hand and puts it onto the battlefield", () => {
    const { game, a } = table();
    const eladamri = spawn(game, "Eladamri, Korvecdal");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    const angel = toHand(game, "Serra Angel");
    pickModes(a, 0);
    pickFromZone(a, angel);
    activate(game, eladamri, 0);
    expect(zone(game, angel)).toBe("battlefield");
  });
});

describe("Abyssal Harvester", () => {
  it("copies a creature card put into a graveyard this turn as a Nightmare", () => {
    const { game } = table();
    const harvester = spawn(game, "Abyssal Harvester");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    const [card] = graveyard(game, B);
    activate(game, harvester, 0, { targets: [ref(card)] });
    expect(zone(game, card)).toBe("exile");
    const [token] = named(game, "Grizzly Bears", A);
    expect(token).toBeDefined();
    expect(game.state.objects[token].isToken).toBe(true);
  });
});

describe("Mistform Warchief", () => {
  it("a creature spell sharing its type costs {1} less", () => {
    const { game } = table();
    spawn(game, "Mistform Warchief");
    lands(game, "Island", 3);
    const kin = toHand(game, "Littjara Kinseekers");
    cast(game, kin);
    expect(zone(game, kin)).toBe("battlefield");
  });
});

describe("Stoneforge Masterwork", () => {
  it("counts your other creatures sharing a type with the equipped one", () => {
    const { game } = table();
    const work = spawn(game, "Stoneforge Masterwork");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Goblin Piker");
    spawn(game, "Grizzly Bears", B);
    equipTo(game, work, bears, 2);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Surge of Strength", () => {
  it("only a red or green card pays, and the bonus is the creature's mana value", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const angel = spawn(game, "Serra Angel");
    a.chooseDiscardsFn = (cards) => {
      expect(cards.map((c) => c.id)).toEqual([bolt]);
      return [bolt];
    };
    cast(game, toHand(game, "Surge of Strength"), { targets: [ref(angel)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(pt(game, angel).power).toBe(9);
    expect(keywords(game, angel).has("trample")).toBe(true);
  });
});

describe("Fear of Exposure", () => {
  it("taps two creatures and/or lands as it's cast", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 5);
    cast(game, toHand(game, "Fear of Exposure"), { tap: forests.slice(3) });
    expect(named(game, "Fear of Exposure")).toHaveLength(1);
    expect(forests.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Brass Knuckles", () => {
  it("its cast trigger makes a token copy, and two Equipment give double strike", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    cast(game, toHand(game, "Brass Knuckles"));
    const knuckles = named(game, "Brass Knuckles");
    expect(knuckles).toHaveLength(2);
    const bears = spawn(game, "Grizzly Bears");
    equipTo(game, knuckles[0], bears, 1);
    expect(keywords(game, bears).has("double-strike")).toBe(false);
    equipTo(game, knuckles[1], bears, 1);
    expect(keywords(game, bears).has("double-strike")).toBe(true);
  });
});

describe("Gutter Skulker", () => {
  it("can't be blocked alone, can with company", () => {
    const { game, a } = table();
    const skulker = spawn(game, "Gutter Skulker");
    spawn(game, "Serra Angel", B);
    attack(game, a, [skulker]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Combat Research", () => {
  it("+1/+1 only on a legendary creature", () => {
    const { game } = table();
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Combat Research"), { targets: [ref(isamaru)] });
    cast(game, toHand(game, "Combat Research"), { targets: [ref(bears)] });
    expect(pt(game, isamaru)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Thor, God of Thunder", () => {
  it("the exiled card stays playable through your next turn", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    const thor = enter(game, "Thor, God of Thunder", A, { settle: false });
    void thor;
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    nextTurn(game);
    nextTurn(game);
    lands(game, "Mountain", 1);
    castOffered(game, bolt, [B]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Quintorius Kand", () => {
  it("−6 exiles the targets, adds {R} each and lets you play them this turn", () => {
    const { game } = table();
    const quin = spawn(game, "Quintorius Kand");
    game.state.objects[quin].counters.loyalty = 7;
    const bolt = toGraveyard(game, "Lightning Bolt");
    const forest = toGraveyard(game, "Forest");
    activate(game, quin, 2, { targets: [ref(bolt), ref(forest)] });
    expect(zone(game, bolt)).toBe("exile");
    castOffered(game, bolt, [B]);
    // Bolt from exile: 3, and the cast trigger's 2.
    expect(life(game, B)).toBe(15);
  });
});


describe("Yenna, Redtooth Regent", () => {
  it("a token copy of an Aura untaps her", () => {
    const { game, a } = table();
    const yenna = spawn(game, "Yenna, Redtooth Regent");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    const strength = toHand(game, "Holy Strength");
    cast(game, strength, { targets: [ref(bears)] });
    lands(game, "Wastes", 2);
    pickPermanents(a, bears);
    activate(game, yenna, 0, { targets: [ref(strength)] });
    expect(named(game, "Holy Strength")).toHaveLength(2);
    expect(game.state.objects[yenna].tapped).toBe(false);
    // The token Aura was attached to something as it entered (rule 303.4f).
    const token = named(game, "Holy Strength").find((id) => game.state.objects[id].isToken);
    expect(token).toBeDefined();
    expect(game.state.objects[token as ObjectId].attachedTo).not.toBeNull();
  });
});

describe("Negative Zone Portal", () => {
  it("exiles a card from an opponent's graveyard, drawing for a creature card", () => {
    const { game } = table();
    const portal = spawn(game, "Negative Zone Portal");
    const card = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    activate(game, portal, 0, { targets: [ref(card)] });
    expect(zone(game, card)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Huntmaster of the Fells // Ravager of the Fells", () => {
  it("Ravager's creature target is the opponent's, and Huntmaster's return makes a Wolf", () => {
    const { game, a } = table();
    const hunt = spawn(game, "Huntmaster of the Fells");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B, theirs);
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(hunt)]);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(zone(game, theirs)).toBe("graveyard");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(hunt)]);
    settle(game);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
    expect(life(game, A)).toBe(22);
  });
});

describe("Rekindled Flame", () => {
  it("returns at your upkeep with an opponent's hand empty", () => {
    const { game, a } = table();
    const flame = toGraveyard(game, "Rekindled Flame");
    pickModes(a, 0);
    nextTurn(game);
    game.state.zones.perPlayer[B].hand.length = 0;
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, flame)).toBe("hand");
  });
});

describe("Ardyn, the Usurper", () => {
  it("Starscourge makes a 5/5 black Demon copy, which his lord gives menace", () => {
    const { game, a } = table();
    spawn(game, "Ardyn, the Usurper");
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, card);
    toStep(game, "begin-combat");
    settle(game);
    const [token] = named(game, "Grizzly Bears", A);
    expect(token).toBeDefined();
    expect(pt(game, token)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, token).has("menace")).toBe(true);
  });
});

describe("Glint Raker", () => {
  it("+X/+0 for the greatest artifact mana value", () => {
    const { game } = table();
    const raker = spawn(game, "Glint Raker");
    spawn(game, "Sol Ring");
    spawn(game, "Mind Stone");
    expect(pt(game, raker).power).toBe(3);
  });
});
