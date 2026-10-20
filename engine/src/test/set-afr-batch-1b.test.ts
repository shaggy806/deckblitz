/**
 * Adventures in the Forgotten Realms and its Commander set, group b: Warlock
 * Class, Krydle of Baldur's Gate, Yuan-Ti Malison, Diviner's Portent, Barrowin
 * of Clan Undurr, Death-Priest of Myrkul, Fates' Reversal, Delver's Torch,
 * Drizzt Do'Urden, Find the Path, Demogorgon's Clutches, Dungeon Crawler and
 * Burning Hands — each on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

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
  life,
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
import type { BlockOffer } from "./harness.js";

const ventures = (game: Game, player = A): number =>
  game.state.eventLog.filter((e) => e.type === "ventured" && e.player === player).length;

/** Enter Lost Mine of Phandelver whenever asked, and take the first room at a fork. */
const intoLostMine = (seat: ScriptedController): void => {
  seat.chooseVentureFn = (_view, offer) =>
    offer.dungeons !== undefined ? { dungeon: "Lost Mine of Phandelver" } : { room: offer.rooms![0]! };
};

/** What `blocker` (bob's) may block once `attackers` (alice's) attack bob —
 * nothing when bob isn't asked to block at all. */
function blockable(game: Game, seat: ScriptedController, attackers: readonly ObjectId[], blocker: ObjectId): readonly ObjectId[] {
  seat.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.turn.step === "combat-damage" || s.turn.step === "end-combat");
  const offer = game.legalActions(B).find((o): o is BlockOffer => o.kind === "declare-blockers");
  return offer?.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
}

describe("Warlock Class", () => {
  it("level 1: at your end step, if a creature died this turn, each opponent loses 1 life", () => {
    const { game } = table();
    spawn(game, "Warlock Class");
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(20);
    toStep(game, "precombat-main");
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(19);
  });

  it("level 2 takes one of the top three and bins the rest; level 3 doubles the life lost this turn", () => {
    const { game, a } = table();
    const warlock = spawn(game, "Warlock Class");
    spawn(game, "Swamp");
    spawn(game, "Swamp");
    for (let i = 0; i < 8; i += 1) spawn(game, "Wastes");
    const third = toLibrary(game, "Hill Giant");
    const second = toLibrary(game, "Grizzly Bears");
    const top = toLibrary(game, "Craw Wurm");
    const seen = pickFromZone(a, second);
    activate(game, warlock, 0);
    expect([...seen.offered].sort()).toEqual([top, second, third].sort());
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, top)).toBe("graveyard");
    expect(zone(game, third)).toBe("graveyard");
    activate(game, warlock, 1);
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0 }, [ref(B)]);
    settle(game);
    expect(life(game, B)).toBe(17);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(14);
  });
});

describe("Krydle of Baldur's Gate", () => {
  it("combat damage: that player loses 1 and mills one, then you gain 1 and scry 1", () => {
    const { game, a } = table();
    const krydle = spawn(game, "Krydle of Baldur's Gate");
    pickModes(a);
    attack(game, a, [krydle], B);
    expect(life(game, B)).toBe(18);
    expect(graveyard(game, B)).toHaveLength(1);
    expect(life(game, A)).toBe(21);
  });

  it("whenever you attack, paying {2} makes the target unblockable", () => {
    const { game, a } = table();
    const krydle = spawn(game, "Krydle of Baldur's Gate");
    spawn(game, "Wastes");
    spawn(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, krydle);
    pickModes(a);
    expect(blockable(game, a, [krydle], bears)).toContain(krydle);

    const paid = table();
    const krydle2 = spawn(paid.game, "Krydle of Baldur's Gate");
    spawn(paid.game, "Wastes");
    spawn(paid.game, "Wastes");
    const bears2 = spawn(paid.game, "Grizzly Bears", B);
    pickTargets(paid.a, krydle2);
    pickModes(paid.a, 0);
    expect(blockable(paid.game, paid.a, [krydle2], bears2)).toEqual([]);
    expect(keywords(paid.game, krydle2).has("unblockable")).toBe(true);
  });
});

describe("Yuan-Ti Malison", () => {
  it("can't be blocked while it attacks alone, but can beside another attacker", () => {
    const { game, a } = table();
    const yuanTi = spawn(game, "Yuan-Ti Malison");
    const blocker = spawn(game, "Grizzly Bears", B);
    expect(blockable(game, a, [yuanTi], blocker)).toEqual([]);

    const second = table();
    const yuanTi2 = spawn(second.game, "Yuan-Ti Malison");
    const bears = spawn(second.game, "Grizzly Bears");
    const blocker2 = spawn(second.game, "Grizzly Bears", B);
    expect(blockable(second.game, second.a, [yuanTi2, bears], blocker2)).toContain(yuanTi2);
  });
});

describe("Diviner's Portent", () => {
  it("adds the cards in your hand to the roll: with a full hand it's 15+, scry X then draw X", () => {
    const { game, a } = table();
    for (let i = 0; i < 15; i += 1) toHand(game, "Wastes");
    for (let i = 0; i < 3; i += 1) spawn(game, "Island");
    for (let i = 0; i < 2; i += 1) spawn(game, "Wastes");
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    const portent = toHand(game, "Diviner's Portent");
    const before = hand(game, A).length;
    cast(game, portent, { x: 2 });
    expect(scried).toBe(2);
    expect(hand(game, A)).toHaveLength(before - 1 + 2);
  });
});

describe("Barrowin of Clan Undurr", () => {
  it("attacking returns up to one creature card with mana value 3 or less — only once you've completed a dungeon", () => {
    const { game, a } = table();
    const barrowin = spawn(game, "Barrowin of Clan Undurr");
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Craw Wurm");
    pickFromZone(a, bears);
    attack(game, a, [barrowin], B);
    expect(zone(game, bears)).toBe("graveyard");

    const second = table();
    const barrowin2 = spawn(second.game, "Barrowin of Clan Undurr");
    const bears2 = toGraveyard(second.game, "Grizzly Bears");
    toGraveyard(second.game, "Craw Wurm");
    second.game.state.players[A].completedDungeons = ["Lost Mine of Phandelver"];
    const seen = pickFromZone(second.a, bears2);
    attack(second.game, second.a, [barrowin2], B);
    expect(seen.offered).toEqual([bears2]);
    expect(zone(second.game, bears2)).toBe("battlefield");
  });

  it("ventures as it enters", () => {
    const { game, a } = table();
    intoLostMine(a);
    enter(game, "Barrowin of Clan Undurr");
    expect(ventures(game)).toBe(1);
  });
});

describe("Death-Priest of Myrkul", () => {
  it("pumps Skeletons, Vampires and Zombies; pays {1} at your end step for a Skeleton if a creature died", () => {
    const { game, a } = table();
    spawn(game, "Death-Priest of Myrkul");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Wastes");
    pickModes(a, 0);
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Skeleton Token", A)).toBe(1);
    const [skeleton] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Skeleton Token");
    expect(pt(game, skeleton!)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Fates' Reversal", () => {
  it("returns up to one creature card and ventures — with no target too", () => {
    const { game, a } = table();
    intoLostMine(a);
    spawn(game, "Swamp");
    spawn(game, "Wastes");
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Fates' Reversal"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(ventures(game)).toBe(1);
    spawn(game, "Swamp");
    spawn(game, "Wastes");
    cast(game, toHand(game, "Fates' Reversal"), { targets: [null] });
    expect(ventures(game)).toBe(2);
  });
});

describe("Delver's Torch", () => {
  it("equipped creature attacking ventures", () => {
    const { game, a } = table();
    intoLostMine(a);
    const torch = spawn(game, "Delver's Torch");
    const bears = spawn(game, "Grizzly Bears");
    for (let i = 0; i < 3; i += 1) spawn(game, "Wastes");
    activate(game, torch, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    attack(game, a, [bears], B);
    expect(ventures(game)).toBe(1);
  });
});

describe("Drizzt Do'Urden", () => {
  it("enters with Guenhwyvar", () => {
    const { game } = table();
    enter(game, "Drizzt Do'Urden");
    expect(tokensNamed(game, "Guenhwyvar", A)).toBe(1);
  });

  it("grows by the difference when a bigger creature dies — read as it last existed", () => {
    const { game } = table();
    const drizzt = spawn(game, "Drizzt Do'Urden");
    destroy(game, spawn(game, "Hill Giant", B));
    expect(counters(game, drizzt)).toBe(0);
    destroy(game, spawn(game, "Craw Wurm", B));
    expect(counters(game, drizzt)).toBe(3);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 5, toughness: 0, duration: "end-of-turn" }, [ref(bears)]);
    destroy(game, bears);
    expect(counters(game, drizzt)).toBe(4);
  });

  it("two bigger creatures dying at once: the second trigger finds Drizzt grown past it (the ruling)", () => {
    const { game } = table();
    const drizzt = spawn(game, "Drizzt Do'Urden");
    spawn(game, "Craw Wurm", B);
    spawn(game, "Craw Wurm", B);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature", controlledBy: "you" } });
    settle(game);
    expect(counters(game, drizzt)).toBe(3);
  });
});

describe("Find the Path", () => {
  it("ventures as it enters, attached to the land", () => {
    const { game, a } = table();
    intoLostMine(a);
    const land = spawn(game, "Wastes");
    for (let i = 0; i < 3; i += 1) spawn(game, "Forest");
    pickTargets(a, land);
    cast(game, toHand(game, "Find the Path"), { targets: [ref(land)] });
    expect(ventures(game)).toBe(1);
    const path = game.battlefield.find((id) => game.state.objects[id].cardName === "Find the Path");
    expect(game.state.objects[path!].attachedTo).toBe(land);
  });
});

describe("Demogorgon's Clutches", () => {
  it("target opponent discards two, mills two and loses 2 life", () => {
    const { game } = table();
    spawn(game, "Swamp");
    spawn(game, "Wastes");
    spawn(game, "Wastes");
    const before = hand(game, B).length;
    cast(game, toHand(game, "Demogorgon's Clutches"), { targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(before - 2);
    expect(graveyard(game, B)).toHaveLength(4);
    expect(life(game, B)).toBe(18);
  });
});

describe("Dungeon Crawler", () => {
  it("completing a dungeon may return it from your graveyard to your hand", () => {
    const { game, a } = table();
    intoLostMine(a);
    pickModes(a, 0);
    const crawler = toGraveyard(game, "Dungeon Crawler");
    for (let i = 0; i < 4; i += 1) {
      game.debugApplyEffect(A, { kind: "venture" });
      settle(game);
    }
    expect(game.state.players[A].completedDungeons).toEqual(["Lost Mine of Phandelver"]);
    expect(zone(game, crawler)).toBe("hand");
  });

  it("enters tapped", () => {
    const { game } = table();
    spawn(game, "Swamp");
    const crawler = toHand(game, "Dungeon Crawler");
    cast(game, crawler);
    expect(game.state.objects[crawler].tapped).toBe(true);
  });
});

describe("Burning Hands", () => {
  it("2 damage, or 6 to a green permanent", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    for (let i = 0; i < 4; i += 1) spawn(game, "Mountain");
    cast(game, toHand(game, "Burning Hands"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(2);
    cast(game, toHand(game, "Burning Hands"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});
