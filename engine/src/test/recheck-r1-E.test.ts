import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
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

describe("Cavalier of Thorns", () => {
  it("puts a revealed land onto the battlefield and the rest into the graveyard", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    const forest = toLibrary(game, "Forest");
    const before = graveyard(game).length;
    enter(game, "Cavalier of Thorns");
    expect(zone(game, forest)).toBe("battlefield");
    expect(graveyard(game).length - before).toBe(4);
  });

  it("dies: exiles itself to put another card on top of the library, never itself", () => {
    const { game, a } = table();
    const cavalier = spawn(game, "Cavalier of Thorns");
    toGraveyard(game, "Walking Corpse");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, (offered) => [offered[0].includes(bears) ? bears : null]);
    pickModes(a, 0);
    destroy(game, cavalier);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0].some((id) => game.state.objects[id as ObjectId]?.cardName === "Cavalier of Thorns")).toBe(false);
    expect(zone(game, bears)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bears);
    expect(named(game, "Cavalier of Thorns").length).toBe(0);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Cavalier of Thorns")).toBe(false);
  });
});

describe("Conjurer's Bauble", () => {
  it("draws a card with no target chosen", () => {
    const { game } = table();
    const bauble = spawn(game, "Conjurer's Bauble");
    const before = hand(game).length;
    activate(game, bauble, 0, { targets: [null] });
    expect(hand(game).length - before).toBe(1);
    expect(zone(game, bauble)).toBe("graveyard");
  });

  it("puts the target on the bottom of the library, then draws", () => {
    const { game } = table();
    const bauble = spawn(game, "Conjurer's Bauble");
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, bauble, 0, { targets: [ref(bears)] });
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(bears);
  });
});

describe("Ensnared by the Mara", () => {
  it("each opponent chooses; the exile-four damage counts only that player's cards", () => {
    const { game, a, b, c } = table({ players: 3 });
    const bobsBears = toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Grizzly Bears", C);
    b.chooseModesFn = () => [0];
    c.chooseModesFn = () => [1];
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((w) => w.card === bobsBears);
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: bobsBears, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Ensnared by the Mara"));
    settle(game);
    expect(zone(game, bobsBears)).toBe("battlefield");
    expect(game.state.objects[bobsBears].controller).toBe(A);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(18);
  });
});

describe("Helm of the Ghastlord", () => {
  it("a black enchanted creature gets +1/+1 and makes the player it damages discard", () => {
    const { game, a } = table();
    const corpse = spawn(game, "Walking Corpse");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Helm of the Ghastlord"), { targets: [ref(corpse)] });
    expect(pt(game, corpse)).toEqual({ power: 3, toughness: 3 });
    const before = hand(game, B).length;
    const mine = hand(game).length;
    a.declareAttackersFn = () => [{ attacker: corpse, defender: B }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(life(game, B)).toBe(17);
    expect(hand(game, B).length).toBe(before - 1);
    expect(hand(game).length).toBe(mine);
  });

  it("a blue enchanted creature draws its controller a card", () => {
    const { game, a } = table();
    const merfolk = spawn(game, "Coral Merfolk");
    lands(game, "Island", 4);
    cast(game, toHand(game, "Helm of the Ghastlord"), { targets: [ref(merfolk)] });
    const mine = hand(game).length;
    a.declareAttackersFn = () => [{ attacker: merfolk, defender: B }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(hand(game).length).toBe(mine + 1);
  });
});

describe("Satsuki, the Living Lore and The First Iroan Games", () => {
  it("Satsuki's lore counter fires the next chapter; its dies mode returns a Saga card", () => {
    const { game, a } = table();
    const satsuki = spawn(game, "Satsuki, the Living Lore");
    const saga = enter(game, "The First Iroan Games");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    activate(game, satsuki);
    expect(counters(game, saga, "lore")).toBe(2);
    expect(counters(game, bears)).toBe(3);

    const sagaCard = toGraveyard(game, "The First Iroan Games");
    a.chooseModesFn = (_view, _min, _max, texts) => (texts.length === 2 ? [1] : [0]);
    pickTargets(a, sagaCard);
    destroy(game, satsuki);
    expect(zone(game, sagaCard)).toBe("hand");
  });
});

describe("The Ooze", () => {
  it("makes a Mutagen for each +1/+1 counter on a leaving creature, read before -1/-1 counters cancel", () => {
    const { game } = table();
    spawn(game, "The Ooze");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(bears)]);
    settle(game);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 5 }, [ref(bears)]);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Mutagen Token", A)).toBe(3);
  });
});

describe("Yorvo, Lord of Garenbrig", () => {
  it("enters with four counters; a bigger green creature gives two, a smaller one one", () => {
    const { game } = table();
    const yorvo = enter(game, "Yorvo, Lord of Garenbrig");
    expect(counters(game, yorvo)).toBe(4);
    enter(game, "Craw Wurm");
    expect(counters(game, yorvo)).toBe(6);
    enter(game, "Grizzly Bears");
    expect(counters(game, yorvo)).toBe(7);
  });
});
