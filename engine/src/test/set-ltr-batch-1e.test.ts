/**
 * The Lord of the Rings: Tales of Middle-earth (LTR/LTC), batch 1e. One test
 * per card whose behaviour is more than a stat line or an already-tested
 * pattern, on the clause most likely to be wrong — written from the Oracle
 * text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { ringBearerOf } from "../ring.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
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
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** A token named `name` on `player`'s battlefield. */
function token(game: Game, name: string, player = A): ObjectId {
  const id = spawn(game, name, player);
  game.state.objects[id].isToken = true;
  return id;
}

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("LTR batch 1e", () => {
  it("Gandalf the Grey: each mode once for this Gandalf; the chosen one isn't offered again", () => {
    const { game, a } = table();
    const gandalf = spawn(game, "Gandalf the Grey");
    lands(game, "Mountain", 2);
    const offered: string[][] = [];
    let want = "deals 3 damage";
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered.push([...texts]);
      return [texts.findIndex((t) => t.includes(want))];
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - 3 - 3);
    want = "on top of its owner's library";
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(offered[1].some((t) => t.includes("deals 3 damage"))).toBe(false);
    expect(offered[1]).toHaveLength(3);
    expect(library(game)[0]).toBe(gandalf);
  });

  it("Gandalf the Grey: the copy mode copies the instant that triggered it", () => {
    const { game, a } = table();
    spawn(game, "Gandalf the Grey");
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.findIndex((t) => t.startsWith("Copy target"))];
    // The mode's target is the Bolt; the copy keeps bob as its target.
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      return legal.map((slot) =>
        slot.find((t) => t.kind === "object" && t.object === bolt) ??
        slot.find((t) => t.kind === "player" && t.player === B) ??
        null,
      );
    };
    cast(game, bolt, { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });

  it("Arwen Undómiel: scrying puts a +1/+1 counter on target creature", () => {
    const { game, a } = table();
    const arwen = spawn(game, "Arwen Undómiel");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    lands(game, "Island", 3);
    pickTargets(a, bears);
    activate(game, arwen, 0);
    expect(counters(game, bears)).toBe(1);
  });

  it("Saruman the White: only the second spell each turn amasses Orcs 2", () => {
    const { game } = table();
    spawn(game, "Saruman the White");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Army Token")).toBe(0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const [army] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Army Token");
    expect(counters(game, army)).toBe(2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, army)).toBe(2);
  });

  it("Gandalf's Sanction: X from instants and sorceries in your graveyard, excess to the controller", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    for (const name of ["Lightning Bolt", "Opt", "Divination", "Shock"]) toGraveyard(game, name);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Gandalf's Sanction"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("Frodo Baggins: tempts on another legend entering; must be blocked only while he's the Ring-bearer", () => {
    const { game, a } = table();
    const frodo = toHand(game, "Frodo Baggins");
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    pickPermanents(a, frodo);
    cast(game, frodo);
    expect(ringBearerOf(game.state, A)).toBe(frodo);
    // A 1-power blocker: the Ring makes Frodo unblockable by greater power.
    spawn(game, "Llanowar Elves", B);
    toStep(game, "precombat-main", A);
    const offer = blockOffer(game, a, [frodo]);
    expect(offer.mustBeBlockedIfAble).toEqual([frodo]);
  });

  it("Frodo Baggins: another legendary creature entering tempts you, and Frodo stops being forced once it's chosen", () => {
    const { game, a } = table();
    const frodo = spawn(game, "Frodo Baggins");
    spawn(game, "Grizzly Bears", B);
    expect(ringBearerOf(game.state, A)).toBeUndefined();
    const isamaru = toHand(game, "Isamaru, Hound of Konda");
    lands(game, "Plains", 1);
    pickPermanents(a, isamaru);
    cast(game, isamaru);
    expect(ringBearerOf(game.state, A)).toBe(isamaru);
    toStep(game, "precombat-main", A);
    const offer = blockOffer(game, a, [frodo]);
    expect(offer.mustBeBlockedIfAble ?? []).toEqual([]);
  });

  it("Legolas, Master Archer: a spell on Legolas grows him; one on an opponent's creature shoots up to one creature", () => {
    const { game, a } = table();
    const legolas = spawn(game, "Legolas, Master Archer");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(legolas)] });
    expect(counters(game, legolas)).toBe(1);
    expect(pt(game, legolas).power).toBe(5);
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Mountain", 1);
    pickTargets(a, wurm);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    expect(zone(game, wurm)).toBe("graveyard");
    // A spell at a player, or at a creature you control, doesn't shoot.
    const other = spawn(game, "Craw Wurm", B);
    lands(game, "Mountain", 1);
    pickTargets(a, other);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(zone(game, other)).toBe("battlefield");
  });

  it("Arwen's Gift: {1} less with two legendary creatures, not with one", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Isamaru, Hound of Konda");
    expect(() => cast(game, toHand(game, "Arwen's Gift"))).toThrow(/refused/);
    spawn(game, "Isamaru, Hound of Konda");
    const before = hand(game).length;
    cast(game, hand(game).find((id) => game.state.objects[id].cardName === "Arwen's Gift")!);
    expect(hand(game).length).toBe(before - 1 + 2);
  });

  it("Shire Shirriff: sacrifice a token, then exile an opponent's creature until Shirriff leaves", () => {
    const { game, a } = table();
    const clue = token(game, "Clue Token");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    const shirriff = enter(game, "Shire Shirriff");
    expect(game.state.objects[clue]?.zone ?? "gone").not.toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, shirriff);
    expect(controller(game, named(game, "Grizzly Bears")[0])).toBe(B);
  });

  it("Shire Shirriff: declining the sacrifice exiles nothing", () => {
    const { game, a } = table();
    token(game, "Clue Token");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    pickTargets(a, bears);
    enter(game, "Shire Shirriff");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Lost to Legend: a nonland historic permanent goes fourth from the top", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const isamaru = spawn(game, "Isamaru, Hound of Konda", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Lost to Legend"), { targets: [ref(bears)], settle: false })).toThrow(/refused/);
    cast(game, hand(game).find((id) => game.state.objects[id].cardName === "Lost to Legend")!, {
      targets: [ref(isamaru)],
    });
    expect(library(game, B).indexOf(isamaru)).toBe(3);
  });

  it("Council's Deliberation: from the graveyard, with an Island, a scry lets you exile it to draw", () => {
    const { game, a } = table();
    const deliberation = toGraveyard(game, "Council's Deliberation");
    spawn(game, "Island");
    pickModes(a, 0);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "scry", amount: 1 }, []);
    settle(game);
    expect(zone(game, deliberation)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
  });

  it("Council's Deliberation: without an Island it doesn't trigger", () => {
    const { game, a } = table();
    const deliberation = toGraveyard(game, "Council's Deliberation");
    spawn(game, "Forest");
    pickModes(a, 0);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "scry", amount: 1 }, []);
    settle(game);
    expect(zone(game, deliberation)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });

  it("Mushroom Watchdogs: sacrifice a Food for a counter and vigilance", () => {
    const { game } = table();
    const dogs = spawn(game, "Mushroom Watchdogs");
    const food = token(game, "Food Token");
    game.dispatch({ type: "activate-ability", player: A, source: dogs, abilityIndex: 0, targets: [], sacrifice: food });
    settle(game);
    expect(game.state.objects[food]?.zone ?? "gone").not.toBe("battlefield");
    expect(counters(game, dogs)).toBe(1);
    expect(keywords(game, dogs).has("vigilance")).toBe(true);
  });

  it("Oath of the Grey Host: chapter I gives you and the target opponent a Food each", () => {
    const { game, a } = table({ players: 3 });
    pickTargets(a, B);
    enter(game, "Oath of the Grey Host");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", B)).toBe(1);
  });

  it("Brandywine Farmer: a Food on entering and another on leaving", () => {
    const { game } = table();
    const farmer = enter(game, "Brandywine Farmer");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    destroy(game, farmer);
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
  });

  it("Mirkwood Channeler: target Elf gets +X/+X and trample, X the Forests you control", () => {
    const { game, a } = table();
    spawn(game, "Mirkwood Channeler");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Forest", 3);
    pickTargets(a, elves);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, elves)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, elves).has("trample")).toBe(true);
  });

  it("Warbeast of Gorgoroth: amasses for itself and for another creature with power 4 or greater, not a smaller one", () => {
    const { game } = table();
    const warbeast = spawn(game, "Warbeast of Gorgoroth");
    destroy(game, spawn(game, "Hill Giant"));
    expect(tokensNamed(game, "Army Token")).toBe(0);
    destroy(game, spawn(game, "Craw Wurm"));
    const [army] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Army Token");
    expect(counters(game, army)).toBe(2);
    destroy(game, spawn(game, "Craw Wurm", B));
    expect(counters(game, army)).toBe(2);
    destroy(game, warbeast);
    expect(counters(game, army)).toBe(4);
  });

  it("Chance-Met Elves: only one counter however often you scry in a turn", () => {
    const { game } = table();
    const elves = spawn(game, "Chance-Met Elves");
    game.debugApplyEffect(A, { kind: "scry", amount: 1 }, []);
    settle(game);
    game.debugApplyEffect(A, { kind: "scry", amount: 1 }, []);
    settle(game);
    expect(counters(game, elves)).toBe(1);
  });

  it("Éomer of the Riddermark: a Soldier only if you control the creature with the greatest power", () => {
    const { game, a } = table();
    const eomer = spawn(game, "Éomer of the Riddermark");
    spawn(game, "Craw Wurm", B); // 6 power beats Éomer's 5
    attack(game, a, [eomer]);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(0);

    const second = table();
    const other = spawn(second.game, "Éomer of the Riddermark");
    spawn(second.game, "Grizzly Bears", B);
    attack(second.game, second.a, [other]);
    expect(tokensNamed(second.game, "Human Soldier Token", A)).toBe(1);
  });

  it("Rush the Room: haste only for a Goblin or Orc", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const goblin = spawn(game, "Raging Goblin");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Rush the Room"), { targets: [ref(goblin)] });
    cast(game, toHand(game, "Rush the Room"), { targets: [ref(bears)] });
    expect(keywords(game, goblin).has("haste")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(false);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(pt(game, bears).power).toBe(3);
  });

  it("Banish from Edoras: {2} less only when it targets a tapped creature", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const untapped = spawn(game, "Grizzly Bears", B);
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const banish = toHand(game, "Banish from Edoras");
    expect(() => cast(game, banish, { targets: [ref(untapped)] })).toThrow();
    expect(zone(game, banish)).toBe("hand");
    cast(game, banish, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("exile");
  });

  it("The Balrog, Flame of Udûn: an opponent's legendary creature dying sends it to the bottom; your own doesn't", () => {
    const { game } = table();
    const balrog = spawn(game, "The Balrog, Flame of Udûn");
    destroy(game, spawn(game, "Isamaru, Hound of Konda"));
    expect(zone(game, balrog)).toBe("battlefield");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(zone(game, balrog)).toBe("battlefield");
    destroy(game, spawn(game, "Isamaru, Hound of Konda", B));
    expect(zone(game, balrog)).toBe("library");
    expect(library(game).at(-1)).toBe(balrog);
  });

  it("The Balrog, Flame of Udûn: dying alongside the legend, it stays in the graveyard (the ruling)", () => {
    const { game } = table();
    const balrog = spawn(game, "The Balrog, Flame of Udûn");
    spawn(game, "Isamaru, Hound of Konda", B);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(zone(game, balrog)).toBe("graveyard");
  });

  it("The Balrog, Flame of Udûn: back on the battlefield as a new object, it stays (the ruling)", () => {
    const { game } = table();
    const balrog = spawn(game, "The Balrog, Flame of Udûn");
    const isamaru = spawn(game, "Isamaru, Hound of Konda", B);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(isamaru)]);
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(balrog)]);
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(balrog)]);
    expect(zone(game, balrog)).toBe("battlefield");
    settle(game);
    expect(zone(game, balrog)).toBe("battlefield");
  });

  it("Olog-hai Crusher: can block only while its controller controls a Goblin or Orc", () => {
    const { game, a } = table();
    const crusher = spawn(game, "Olog-hai Crusher", B);
    spawn(game, "Grizzly Bears", B); // so bob is asked to block at all
    const bears = spawn(game, "Grizzly Bears");
    let offer = blockOffer(game, a, [bears]);
    expect(offer.eligible.map((e) => e.blocker)).not.toContain(crusher);

    const second = table();
    const other = spawn(second.game, "Olog-hai Crusher", B);
    spawn(second.game, "Raging Goblin", B);
    offer = blockOffer(second.game, second.a, [spawn(second.game, "Grizzly Bears")]);
    expect(offer.eligible.map((e) => e.blocker)).toContain(other);
  });

  it("Wake the Dragon: its Dragon steals an artifact of the player it hits", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Wake the Dragon"));
    const [dragon] = game.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Dragon Token (Wake the Dragon)",
    );
    expect(keywords(game, dragon).has("menace")).toBe(true);
    game.state.objects[dragon].summoningSick = false;
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    attack(game, a, [dragon]);
    expect(life(game, B)).toBe(14);
    expect(controller(game, ring)).toBe(A);
  });

  it("Mirkwood Elk: returns an Elf card and gains life equal to its power", () => {
    const { game, a } = table();
    const elf = toGraveyard(game, "Elvish Visionary"); // 1/1
    pickTargets(a, elf);
    enter(game, "Mirkwood Elk");
    expect(zone(game, elf)).toBe("hand");
    expect(life(game, A)).toBe(21);
  });

  it("Swarming of Moria: a Treasure and an Orc Army with two counters", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Swarming of Moria"));
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    const [army] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Army Token");
    expect(counters(game, army)).toBe(2);
    expect(graveyard(game).length).toBeGreaterThan(0);
  });
});
