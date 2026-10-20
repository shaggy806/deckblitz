/**
 * Innistrad: Midnight Hunt, group a. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
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
  watchTargets,
  zone,
} from "./harness.js";

const exile = (game: Game): readonly ObjectId[] => game.state.zones.shared.exile;
const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** Count the seat's scry decisions. */
const watchScry = (seat: ScriptedController): { asked: number } => {
  const seen = { asked: 0 };
  seat.chooseScryFn = () => {
    seen.asked += 1;
    return [];
  };
  return seen;
};

/** Take whatever free cast a `cast-now` offers. */
const takeFreeCast = (seat: ScriptedController, player: PlayerId = A): void => {
  seat.chooseCastNowFn = (_view, offer): Extract<Action, { type: "cast-spell" }> | null => {
    const way = offer.casts[0];
    if (way === undefined) return null;
    return {
      type: "cast-spell",
      player,
      card: way.card,
      targets: [],
      via: way.via,
      ...(way.face !== undefined ? { face: way.face } : {}),
      ...(offer.free ? { free: true } : {}),
    };
  };
};

describe("Fading Hope", () => {
  it("bounces a creature and scries 1 when its mana value was 3 or less", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const scry = watchScry(a);
    cast(game, toHand(game, "Fading Hope"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(scry.asked).toBe(1);
  });

  it("no scry for a creature of mana value 4", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const giant = spawn(game, "Craw Wurm", B);
    const scry = watchScry(a);
    cast(game, toHand(game, "Fading Hope"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("hand");
    expect(scry.asked).toBe(0);
  });
});

describe("Geistwave", () => {
  it("draws when you controlled the permanent", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, toHand(game, "Geistwave"), { targets: [ref(bears)] });
    // Geistwave left the hand, the Bears and a drawn card came in.
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
  });

  it("doesn't draw for an opponent's permanent", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Geistwave"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before);
  });
});

describe("Play with Fire", () => {
  it("scries 1 when it damages a player", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const scry = watchScry(a);
    cast(game, toHand(game, "Play with Fire"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(scry.asked).toBe(1);
  });

  it("no scry when the target is a creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const scry = watchScry(a);
    cast(game, toHand(game, "Play with Fire"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(scry.asked).toBe(0);
  });
});

describe("Crawl from the Cellar", () => {
  it("returns a creature card and puts a counter on a Zombie you control; flashback exiles it", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const zombie = spawn(game, "Diregraf Horde");
    const crawl = toHand(game, "Crawl from the Cellar");
    cast(game, crawl, { targets: [ref(bears), ref(zombie)] });
    expect(zone(game, bears)).toBe("hand");
    expect(counters(game, zombie)).toBe(1);
    expect(zone(game, crawl)).toBe("graveyard");

    const giant = toGraveyard(game, "Hill Giant");
    cast(game, crawl, { targets: [ref(giant), null], via: "flashback" });
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, crawl)).toBe("exile");
  });

  it("the Zombie slot takes only a Zombie you control", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = toGraveyard(game, "Grizzly Bears");
    const mine = spawn(game, "Diregraf Horde");
    const theirs = spawn(game, "Diregraf Horde", B);
    const human = spawn(game, "Grizzly Bears");
    const crawl = toHand(game, "Crawl from the Cellar");
    const castWith = (zombie: ObjectId) =>
      game.canDispatch({ type: "cast-spell", player: A, card: crawl, targets: [ref(bears), ref(zombie)] });
    expect(castWith(theirs)).not.toBeNull();
    expect(castWith(human)).not.toBeNull();
    expect(castWith(mine)).toBeNull();
  });
});

describe("Slogurk, the Overslime", () => {
  it("a land card put into your graveyard gives it a counter; a token land doesn't", () => {
    const { game } = table();
    const slogurk = spawn(game, "Slogurk, the Overslime");
    toLibrary(game, "Forest");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 }, []);
    settle(game);
    expect(counters(game, slogurk)).toBe(1);
    const forest = spawn(game, "Forest");
    destroy(game, forest);
    expect(counters(game, slogurk)).toBe(2);
  });

  it("removing three counters returns it to hand, and its leave trigger returns up to three land cards", () => {
    const { game, a } = table();
    const slogurk = spawn(game, "Slogurk, the Overslime");
    game.state.objects[slogurk].counters = { "+1/+1": 3 };
    const forests = [toGraveyard(game, "Forest"), toGraveyard(game, "Forest"), toGraveyard(game, "Island")];
    const fourth = toGraveyard(game, "Swamp");
    pickTargets(a, ...forests);
    activate(game, slogurk, 0);
    expect(zone(game, slogurk)).toBe("hand");
    for (const land of forests) expect(zone(game, land)).toBe("hand");
    expect(zone(game, fourth)).toBe("graveyard");
  });
});

describe("Borrowed Time", () => {
  it("exiles an opponent's nonland permanent until it leaves", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const time = toHand(game, "Borrowed Time");
    cast(game, time);
    expect(zone(game, giant)).toBe("exile");
    destroy(game, time);
    expect(exile(game)).not.toContain(giant);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
  });
});

describe("Arrogant Outlaw", () => {
  it("drains only if an opponent lost life this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Arrogant Outlaw"));
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "each-opponent" }, []);
    // A gain doesn't undo "lost life this turn" (the ruling).
    game.debugApplyEffect(B, { kind: "gain-life", amount: 1 }, []);
    cast(game, toHand(game, "Arrogant Outlaw"));
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Falcon Abomination", () => {
  it("makes a 2/2 black Zombie with decayed", () => {
    const { game } = table();
    lands(game, "Island", 3);
    cast(game, toHand(game, "Falcon Abomination"));
    const [zombie] = named(game, "Zombie Token (Crowded Crypt)");
    expect(pt(game, zombie)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, zombie).has("decayed")).toBe(true);
  });
});

describe("Briarbridge Tracker", () => {
  it("investigates, and is 4/3 while you control a token", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const tracker = toHand(game, "Briarbridge Tracker");
    cast(game, tracker);
    const [clue] = named(game, "Clue Token");
    expect(clue).toBeDefined();
    expect(pt(game, tracker)).toEqual({ power: 4, toughness: 3 });
    destroy(game, clue);
    expect(pt(game, tracker)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Overwhelmed Archivist // Archive Haunt", () => {
  it("the front loots as it enters", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const gy = graveyard(game).length;
    cast(game, toHand(game, "Overwhelmed Archivist"));
    expect(graveyard(game).length).toBe(gy + 1);
  });

  it("disturbed, it's a 2/1 flier that loots on attack and is exiled when it dies", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const card = toGraveyard(game, "Overwhelmed Archivist");
    cast(game, card, { via: "disturb", face: 1 });
    expect(printedCardName(game.state.objects[card])).toBe("Archive Haunt");
    expect(pt(game, card)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, card).has("flying")).toBe(true);
    game.state.objects[card].summoningSick = false;
    const gy = graveyard(game).length;
    a.declareAttackersFn = () => [{ attacker: card, defender: B }];
    toStep(game, "postcombat-main");
    expect(graveyard(game).length).toBe(gy + 1);
    destroy(game, card);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Beloved Beggar // Generous Soul", () => {
  it("disturbed, a 4/4 flying vigilance Spirit, exiled instead of dying", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const card = toGraveyard(game, "Beloved Beggar");
    cast(game, card, { via: "disturb", face: 1 });
    expect(pt(game, card)).toEqual({ power: 4, toughness: 4 });
    expect([...keywords(game, card)].sort()).toEqual(["flying", "vigilance"]);
    destroy(game, card);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Covert Cutpurse // Covetous Geist", () => {
  it("destroys a creature you don't control that was dealt damage this turn — only such a one is offered", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const hurt = spawn(game, "Hill Giant", B);
    const fresh = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant");
    const pinger = spawn(game, "Grizzly Bears");
    for (const target of [hurt, mine]) {
      game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(target)], { source: pinger });
    }
    settle(game);
    const seen = watchTargets(a, (offered) => [offered[0][0] ?? null]);
    cast(game, toHand(game, "Covert Cutpurse"));
    // One legal target is taken without asking: the undamaged Giant and your
    // own damaged one aren't candidates.
    expect(seen.asked).toBe(0);
    expect(zone(game, hurt)).toBe("graveyard");
    expect(zone(game, fresh)).toBe("battlefield");
  });

  it("disturbed, a 2/2 flying deathtouch Spirit, exiled instead of dying", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const card = toGraveyard(game, "Covert Cutpurse");
    cast(game, card, { via: "disturb", face: 1 });
    expect(printedCardName(game.state.objects[card])).toBe("Covetous Geist");
    expect([...keywords(game, card)].sort()).toEqual(["deathtouch", "flying"]);
    destroy(game, card);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Chaplain of Alms // Chapel Shieldgeist", () => {
  const boltAt = (shieldgeist: boolean, chaplain = false): string => {
    const { game } = table();
    if (shieldgeist) {
      // The back face: transform a battlefield Chaplain.
      const back = spawn(game, "Chaplain of Alms", B);
      game.debugApplyEffect(B, { kind: "transform", target: 0 }, [ref(back)]);
      settle(game);
      expect(printedCardName(game.state.objects[back])).toBe("Chapel Shieldgeist");
    }
    const victim = chaplain ? spawn(game, "Chaplain of Alms", B) : spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(victim)] });
    return zone(game, victim);
  };

  it("the front has ward {1}", () => {
    expect(boltAt(false, true)).toBe("battlefield");
  });

  it("the back gives each creature you control ward {1}", () => {
    expect(boltAt(false)).toBe("graveyard");
    expect(boltAt(true)).toBe("battlefield");
  });

  it("disturbed, a flying first strike Spirit, exiled instead of dying", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const card = toGraveyard(game, "Chaplain of Alms");
    cast(game, card, { via: "disturb", face: 1 });
    expect(printedCardName(game.state.objects[card])).toBe("Chapel Shieldgeist");
    expect([...keywords(game, card)].sort()).toEqual(["first-strike", "flying"]);
    destroy(game, card);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Moonrager's Slash", () => {
  it("costs {R} at night", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "day-night", value: "night" }, []);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Moonrager's Slash"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });

  it("costs its full {2}{R} by day", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "day-night", value: "day" }, []);
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Moonrager's Slash"), { targets: [ref(B)] })).toThrow();
  });
});

describe("Deathbonnet Sprout // Deathbonnet Hulk", () => {
  const upkeepWith = (top: string): { game: Game; sprout: ObjectId } => {
    const { game } = table();
    const sprout = spawn(game, "Deathbonnet Sprout");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toLibrary(game, top);
    toStep(game, "upkeep");
    settle(game);
    return { game, sprout };
  };

  it("mills at upkeep, then transforms if that made three creature cards in the graveyard", () => {
    const { game, sprout } = upkeepWith("Craw Wurm");
    expect(graveyard(game).length).toBe(3);
    expect(printedCardName(game.state.objects[sprout])).toBe("Deathbonnet Hulk");
    expect(pt(game, sprout)).toEqual({ power: 3, toughness: 3 });
  });

  it("two creature cards and a land milled: no transform", () => {
    const { game, sprout } = upkeepWith("Forest");
    expect(graveyard(game).length).toBe(3);
    expect(printedCardName(game.state.objects[sprout])).toBe("Deathbonnet Sprout");
  });

  it("the Hulk may exile a card from any graveyard, and grows only for a creature card", () => {
    const { game, a } = table();
    const sprout = spawn(game, "Deathbonnet Sprout");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(sprout)]);
    settle(game);
    expect(printedCardName(game.state.objects[sprout])).toBe("Deathbonnet Hulk");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const land = toGraveyard(game, "Forest");
    const seen = pickFromZone(a, land);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.offered).toContain(theirs);
    expect(zone(game, land)).toBe("exile");
    expect(counters(game, sprout)).toBe(0);
    pickFromZone(a, theirs);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, theirs)).toBe("exile");
    expect(counters(game, sprout)).toBe(1);
  });
});

describe("Diregraf Horde", () => {
  it("makes two decayed Zombies, then exiles up to two target cards from graveyards", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const one = toGraveyard(game, "Grizzly Bears", B);
    const two = toGraveyard(game, "Hill Giant", B);
    const three = toGraveyard(game, "Craw Wurm");
    pickTargets(a, one, two);
    cast(game, toHand(game, "Diregraf Horde"));
    expect(named(game, "Zombie Token (Crowded Crypt)")).toHaveLength(2);
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(zone(game, three)).toBe("graveyard");
  });
});

describe("Ghoulcaller's Harvest", () => {
  it("makes half the creature cards in your graveyard, rounded up", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    for (const name of ["Grizzly Bears", "Hill Giant", "Craw Wurm"]) toGraveyard(game, name);
    toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ghoulcaller's Harvest"));
    expect(named(game, "Zombie Token (Crowded Crypt)")).toHaveLength(2);
  });
});

describe("Curse of Clinging Webs", () => {
  it("a nontoken creature of the enchanted player dies: it's exiled and the Curse's controller gets a Spider", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Curse of Clinging Webs"), { targets: [ref(B)] });
    destroy(game, mine, A);
    expect(zone(game, mine)).toBe("graveyard");
    expect(named(game, "1/2 Green Spider Token (Reach)")).toHaveLength(0);
    destroy(game, bears, A);
    expect(zone(game, bears)).toBe("exile");
    expect(named(game, "1/2 Green Spider Token (Reach)", A)).toHaveLength(1);
    expect(named(game, "1/2 Green Spider Token (Reach)", B)).toHaveLength(0);
  });

  it("a token creature dying does nothing", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Curse of Clinging Webs"), { targets: [ref(B)] });
    game.debugApplyEffect(B, { kind: "create-token", token: "Zombie Token", count: 1 }, []);
    settle(game);
    const [zombie] = named(game, "Zombie Token", B);
    destroy(game, zombie, A);
    expect(named(game, "1/2 Green Spider Token (Reach)")).toHaveLength(0);
  });
});

describe("Collector's Cage", () => {
  const setUp = (target: "giant" | "bears") => {
    const { game, a } = table();
    for (const name of ["Wastes", "Wastes", "Wastes", "Wastes", "Craw Wurm"]) toLibrary(game, name);
    const wurm = library(game)[0];
    pickFromZone(a, wurm);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Collector's Cage"));
    expect(zone(game, wurm)).toBe("exile");
    spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    takeFreeCast(a);
    const [cage] = named(game, "Collector's Cage");
    activate(game, cage, 0, { targets: [ref(target === "giant" ? giant : bears)] });
    return { game, wurm, bears, giant };
  };

  it("with three different powers after the counter, plays the hidden card for free", () => {
    const { game, wurm, giant } = setUp("giant");
    expect(counters(game, giant)).toBe(1);
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("coven is read after the counter: 1, 3, 3 isn't three different powers", () => {
    const { game, wurm, bears } = setUp("bears");
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, wurm)).toBe("exile");
  });
});
