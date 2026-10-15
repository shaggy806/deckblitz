/**
 * Set walk batch 83, part b (2026-10-16): Tarkir: Dragonstorm (TDM), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

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
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const SOLDIER = "Soldier Token (White 2/2)";

const librarySize = (game: Game, player = A): number => game.state.zones.perPlayer[player].library.length;

/** Put `n` +1/+1 counters on `id`. */
function addCounters(game: Game, id: ObjectId, n: number, kind = "+1/+1"): void {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: kind, amount: n }, [ref(id)]);
  settle(game);
}

describe("Ambling Stormshell", () => {
  it("attacking, gets three stun counters and draws three cards", () => {
    const { game, a } = table();
    const shell = spawn(game, "Ambling Stormshell");
    const before = hand(game).length;
    attack(game, a, [shell]);
    expect(counters(game, shell, "stun")).toBe(3);
    expect(hand(game).length).toBe(before + 3);
    expect(life(game, B)).toBe(15);
  });

  it("a Turtle spell untaps it — or, stunned, takes a stun counter off instead (rule 122.1d)", () => {
    const { game, a } = table();
    const shell = spawn(game, "Ambling Stormshell");
    attack(game, a, [shell]);
    lands(game, "Island", 4);
    // Not a Turtle: nothing.
    cast(game, toHand(game, "Wind Drake"));
    expect(counters(game, shell, "stun")).toBe(3);
    cast(game, toHand(game, "Aegis Turtle"));
    expect(counters(game, shell, "stun")).toBe(2);
    expect(game.state.objects[shell].tapped).toBe(true);
  });

  it("untaps when not stunned", () => {
    const { game } = table();
    const shell = spawn(game, "Ambling Stormshell", A, { tapped: true });
    lands(game, "Island", 1);
    cast(game, toHand(game, "Aegis Turtle"));
    expect(game.state.objects[shell].tapped).toBe(false);
  });
});

describe("Twinmaw Stormbrood // Charring Bite", () => {
  it("gains 5 life as the Dragon enters", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const brood = toHand(game, "Twinmaw Stormbrood");
    cast(game, brood);
    expect(zone(game, brood)).toBe("battlefield");
    expect(life(game)).toBe(25);
  });

  it("as Charring Bite, deals 5 to a creature without flying and shuffles itself away", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Craw Wurm", B);
    const angel = spawn(game, "Serra Angel", B);
    const brood = toHand(game, "Twinmaw Stormbrood");
    expect(() => cast(game, brood, { targets: [ref(angel)], face: 1 })).toThrow();
    cast(game, brood, { targets: [ref(giant)], face: 1 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, brood)).toBe("library");
  });
});

describe("Veteran Ice Climber", () => {
  it("attacking, up to one target player mills cards equal to its power", () => {
    const { game, a } = table();
    const climber = spawn(game, "Veteran Ice Climber");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" }, [ref(climber)]);
    pickTargets(a, B);
    const before = librarySize(game, B);
    attack(game, a, [climber]);
    expect(librarySize(game, B)).toBe(before - 3);
    expect(game.state.zones.perPlayer[B].graveyard.length).toBe(3);
  });

  it("may choose no player", () => {
    const { game, a } = table();
    const climber = spawn(game, "Veteran Ice Climber");
    pickTargets(a, null);
    const before = librarySize(game, B);
    attack(game, a, [climber]);
    expect(librarySize(game, B)).toBe(before);
    expect(game.state.objects[climber].tapped).toBe(false);
  });
});

describe("Wail of War", () => {
  it("gives creatures target opponent controls -1/-1 until end of turn", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const theirs = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Wail of War"), { modes: [0], targets: [ref(B)] });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
  });

  it("returns up to two creature cards from your graveyard to your hand", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    cast(game, toHand(game, "Wail of War"), { modes: [1], targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Riling Dawnbreaker // Signaling Roar", () => {
  it("at the beginning of combat on your turn, another creature you control gets +1/+0", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Riling Dawnbreaker");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Craw Wurm", B);
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "postcombat-main");
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(seen.offered[0]).not.toContain(dragon);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("as Signaling Roar, makes a 2/2 white Soldier and shuffles itself away", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const card = toHand(game, "Riling Dawnbreaker");
    cast(game, card, { face: 1 });
    expect(tokensNamed(game, SOLDIER, A)).toBe(1);
    expect(pt(game, named(game, SOLDIER, A)[0])).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, card)).toBe("library");
  });
});

describe("Alchemist's Assistant", () => {
  it("renews from the graveyard: a lifelink counter on target creature", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const monkey = toGraveyard(game, "Alchemist's Assistant");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, monkey, 0, { targets: [ref(bears)] });
    expect(counters(game, bears, "lifelink")).toBe(1);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(zone(game, monkey)).toBe("exile");
  });
});

describe("Sage of the Fang", () => {
  it("puts a +1/+1 counter on target creature as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Sage of the Fang");
    expect(counters(game, bears)).toBe(1);
  });

  it("renews: a +1/+1 counter, then double the +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const sage = toGraveyard(game, "Sage of the Fang");
    const bears = spawn(game, "Grizzly Bears");
    addCounters(game, bears, 1);
    activate(game, sage, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(4);
    expect(zone(game, sage)).toBe("exile");
  });
});

describe("Stormplain Detainment", () => {
  it("exiles an opponent's nonland permanent until it leaves the battlefield", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears");
    const detainment = toHand(game, "Stormplain Detainment");
    cast(game, detainment);
    expect(zone(game, giant)).toBe("exile");
    destroy(game, detainment);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
  });
});

describe("Champion of Dusan", () => {
  it("renews: a +1/+1 counter and a trample counter on target creature", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const champion = toGraveyard(game, "Champion of Dusan");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, champion, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, bears, "trample")).toBe(1);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(zone(game, champion)).toBe("exile");
  });
});

describe("Traveling Botanist", () => {
  it("becoming tapped, may put a land on top into your hand", () => {
    const { game, a } = table();
    const dog = spawn(game, "Traveling Botanist");
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    attack(game, a, [dog]);
    expect(zone(game, forest)).toBe("hand");
  });

  it("a nonland card on top may go to the graveyard instead", () => {
    const { game, a } = table();
    const dog = spawn(game, "Traveling Botanist");
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(bears) ? [bears] : []);
    attack(game, a, [dog]);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Abzan Monument", () => {
  it("searches for a basic Plains, Swamp, or Forest as it enters", () => {
    const { game, a } = table();
    const island = toLibrary(game, "Island");
    const swamp = toLibrary(game, "Swamp");
    const seen = pickFromZone(a, swamp);
    enter(game, "Abzan Monument");
    expect(seen.offered).toContain(swamp);
    expect(seen.offered).not.toContain(island);
    expect(zone(game, swamp)).toBe("hand");
  });

  it("makes an X/X Spirit, X the greatest toughness among your creatures", () => {
    const { game } = table();
    for (const land of ["Plains", "Swamp", "Forest", "Forest"]) spawn(game, land);
    spawn(game, "Hill Giant");
    spawn(game, "Serra Angel");
    spawn(game, "Craw Wurm", B);
    const monument = spawn(game, "Abzan Monument");
    activate(game, monument, 0);
    expect(zone(game, monument)).toBe("graveyard");
    const [spirit] = named(game, "Spirit Token (Abzan Monument)", A);
    expect(pt(game, spirit)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Cori Mountain Stalwart", () => {
  it("on your second spell each turn, deals 2 to each opponent and you gain 2", () => {
    const { game } = table();
    spawn(game, "Cori Mountain Stalwart");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(life(game, B)).toBe(20);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(life(game, B)).toBe(18);
    expect(life(game)).toBe(22);
  });
});

describe("Salt Road Skirmish", () => {
  it("destroys a creature and makes two hasty Warriors sacrificed at the next end step", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Salt Road Skirmish"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    const warriors = named(game, "Red Warrior Token", A);
    expect(tokensNamed(game, "Red Warrior Token", A)).toBe(2);
    expect(keywords(game, warriors[0]).has("haste")).toBe(true);
    nextTurn(game);
    expect(tokensNamed(game, "Red Warrior Token", A)).toBe(0);
  });
});

describe("Channeled Dragonfire", () => {
  it("deals 2 to any target, and harmonizes from the graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const fire = toHand(game, "Channeled Dragonfire");
    cast(game, fire, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, fire)).toBe("graveyard");
    // {5}{R}{R} less the tapped Hill Giant's 3.
    lands(game, "Mountain", 4);
    const giant = spawn(game, "Hill Giant");
    cast(game, fire, { targets: [ref(B)], via: "harmonize", tap: [giant] });
    expect(life(game, B)).toBe(16);
    expect(zone(game, fire)).toBe("exile");
  });
});

describe("Delta Bloodflies", () => {
  it("attacking, each opponent loses 1 only if you control a creature with a counter", () => {
    const { game, a } = table();
    const flies = spawn(game, "Delta Bloodflies");
    attack(game, a, [flies]);
    expect(life(game, B)).toBe(19);
    nextTurn(game);
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears");
    addCounters(game, bears, 1);
    attack(game, a, [flies]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Static Snare", () => {
  it("costs {1} less for each attacking creature, and exiles an artifact or creature until it leaves", () => {
    const { game, a } = table();
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Hill Giant")];
    const wurm = spawn(game, "Craw Wurm", B);
    a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil(
      (s) =>
        s.turn.step === "declare-attackers" &&
        s.priority.holder === A &&
        s.awaiting === null &&
        s.zones.shared.stack.length === 0 &&
        s.pendingTriggers.length === 0,
    );
    expect(attackers.every((id) => game.state.objects[id].tapped)).toBe(true);
    lands(game, "Plains", 3);
    const snare = toHand(game, "Static Snare");
    cast(game, snare);
    expect(zone(game, wurm)).toBe("exile");
    destroy(game, snare);
    expect(named(game, "Craw Wurm", B)).toHaveLength(1);
  });

  it("costs full price with nothing attacking", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Craw Wurm", B);
    expect(() => cast(game, toHand(game, "Static Snare"))).toThrow();
  });
});

describe("Fortress Kin-Guard", () => {
  it("endures 1 as it enters: a +1/+1 counter", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const dog = enter(game, "Fortress Kin-Guard");
    expect(counters(game, dog)).toBe(1);
    expect(tokensNamed(game, "Spirit Token (Great Arashin City)", A)).toBe(0);
  });

  it("or a 1/1 white Spirit", () => {
    const { game, a } = table();
    pickModes(a, 1);
    const dog = enter(game, "Fortress Kin-Guard");
    expect(counters(game, dog)).toBe(0);
    expect(tokensNamed(game, "Spirit Token (Great Arashin City)", A)).toBe(1);
  });
});

describe("Salt Road Packbeast", () => {
  it("has affinity for creatures and draws a card as it enters", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const beast = toHand(game, "Salt Road Packbeast");
    expect(() => cast(game, beast)).toThrow();
    spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, beast);
    expect(zone(game, beast)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
  });
});

describe("Teeming Dragonstorm", () => {
  it("makes two 2/2 Soldiers, and returns to hand when a Dragon you control enters", () => {
    const { game } = table();
    const storm = enter(game, "Teeming Dragonstorm");
    expect(tokensNamed(game, SOLDIER, A)).toBe(2);
    enter(game, "Shivan Dragon", B);
    expect(zone(game, storm)).toBe("battlefield");
    enter(game, "Shivan Dragon");
    expect(zone(game, storm)).toBe("hand");
  });
});

describe("Ureni's Rebuff", () => {
  it("bounces a creature, and harmonizes from the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    const rebuff = toHand(game, "Ureni's Rebuff");
    cast(game, rebuff, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, rebuff)).toBe("graveyard");
    // {5}{U} less the tapped Craw Wurm's 6: just {U}.
    lands(game, "Island", 1);
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, rebuff, { targets: [ref(bears)], via: "harmonize", tap: [wurm] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, rebuff)).toBe("exile");
  });
});
