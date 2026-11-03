/**
 * A token copy makes the copied card's "as this enters" choices (rule 614.12a,
 * and every such card's ruling): off the battlefield, each token for itself
 * (the Bard, King of Dale ruling), then all of them entering together.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { viewFor } from "../view.js";
import {
  A,
  activate,
  B,
  cast,
  keywords,
  lands,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";

const tokens = (game: Game, name?: string): readonly ObjectId[] =>
  game.battlefield.filter((id) => {
    const object = game.state.objects[id];
    return object.isToken && (name === undefined || (object.copyOf ?? object.cardName) === name);
  });

const rebuild = (game: Game, land: ObjectId): void => {
  lands(game, "Swamp", 2);
  lands(game, "Mountain", 2);
  lands(game, "Forest", 2);
  cast(game, toHand(game, "Rebuild the City"), { targets: [ref(land)] });
};

/** A Clone that copied nothing, kept alive by a counter no copy of it gets. */
const spawnClone = (game: Game): ObjectId => {
  const clone = spawn(game, "Clone");
  game.state.objects[clone].counters["+1/+1"] = 1;
  return clone;
};

/** "Create a token that's a copy of target permanent you control", on `of`. */
const replicate = (game: Game, of: ObjectId): void => {
  lands(game, "Island", 5);
  cast(game, toHand(game, "Replication Technique"), { targets: [ref(of)] });
};

describe("a token copy's as-enters choices", () => {
  it("asks each token its own choice, and each keeps its answer (Rebuild the City on Cavern of Souls)", () => {
    const { game, a } = table();
    const cavern = spawn(game, "Cavern of Souls");
    const answers = ["Elf", "Goblin", "Merfolk"];
    let asked = 0;
    a.chooseCreatureTypeFn = () => answers[asked++];
    rebuild(game, cavern);

    expect(asked).toBe(3);
    const made = tokens(game, "Cavern of Souls");
    expect(made).toHaveLength(3);
    expect(made.map((id) => game.state.objects[id].chosenCreatureType).sort()).toEqual(answers);
    for (const id of made) {
      expect(types(game, id)).toEqual(expect.arrayContaining(["land", "creature"]));
      expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
      expect(keywords(game, id).has("vigilance")).toBe(true);
      expect(keywords(game, id).has("menace")).toBe(true);
      expect(game.state.objects[id].summoningSick).toBe(true);
    }
    expect(game.state.suspendedResolutions).toEqual([]);
  });

  it("isn't on the battlefield while it chooses, and waits as plain state", () => {
    const { game, a } = table();
    const cavern = spawn(game, "Cavern of Souls");
    let during = -1;
    let cloned = false;
    let named: string | undefined;
    a.chooseCreatureTypeFn = (_view, source, options) => {
      during = tokens(game).length;
      cloned = structuredClone(game.state).awaiting?.kind === "choose-creature-type";
      // Every seat can name it: the log reads the choice off the view.
      named = viewFor(game.state, game.registry, B).objects[source]?.cardName;
      return options[0];
    };
    rebuild(game, cavern);
    expect(during).toBe(0);
    expect(cloned).toBe(true);
    expect(named).toBe("Cavern of Souls");
    expect(tokens(game)).toHaveLength(3);
  });

  it("gives a copy its own word, read by its own ability (Heraldic Banner)", () => {
    const { game, a } = table();
    const banner = spawn(game, "Heraldic Banner");
    game.state.objects[banner].chosenOnEnter = "W";
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears).power).toBe(2);
    a.chooseCreatureTypeFn = () => "G";
    replicate(game, banner);
    const [token] = tokens(game, "Heraldic Banner");
    expect(game.state.objects[token].chosenOnEnter).toBe("G");
    expect(pt(game, bears).power).toBe(3);
  });

  it("offers a shock land's life, token by token", () => {
    const { game, a } = table();
    a.payLifeForUntappedFn = () => false;
    const shock = spawn(game, "Stomping Ground");
    settle(game);
    let offers = 0;
    a.payLifeForUntappedFn = () => ++offers === 1;
    const before = game.state.players[A].life;
    rebuild(game, shock);
    expect(offers).toBe(3);
    expect(game.state.players[A].life).toBe(before - 2);
    const made = tokens(game, "Stomping Ground");
    expect(made).toHaveLength(3);
    expect(made.filter((id) => game.state.objects[id].tapped)).toHaveLength(2);
  });

  it("has a land that enters tapped enter tapped, its choice made (Thriving Heath)", () => {
    const { game, a } = table();
    const land = spawn(game, "Thriving Heath");
    a.chooseCreatureTypeFn = (_view, _source, options) => options[0];
    rebuild(game, land);
    const made = tokens(game, "Thriving Heath");
    expect(made).toHaveLength(3);
    for (const id of made) {
      expect(game.state.objects[id].tapped).toBe(true);
      expect(game.state.objects[id].chosenOnEnter).toBeDefined();
    }
  });

  it("lets a Clone's copy choose among what's there, none of the tokens entering with it (Kindred Charge)", () => {
    const { game, a } = table();
    // The changeling comes first: without the copies held back, its token
    // would be on the battlefield as the Clone's chooses.
    const automaton = spawn(game, "Universal Automaton");
    const clone = spawnClone(game); // a Shapeshifter
    const angel = spawn(game, "Serra Angel", B);
    a.chooseCreatureTypeFn = () => "Shapeshifter";
    let offered: readonly ObjectId[] = [];
    a.chooseCopyFn = (_view, _source, options) => {
      offered = options;
      return angel;
    };
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Kindred Charge"));

    // Whichever is made first, the other isn't there to be copied.
    expect(offered).toEqual(expect.arrayContaining([clone, automaton, angel]));
    expect(offered.some((id) => game.state.objects[id].isToken)).toBe(false);
    const copied = tokens(game, "Serra Angel");
    expect(copied).toHaveLength(1);
    const other = tokens(game, "Universal Automaton");
    expect(other).toHaveLength(1);
    // "Those tokens gain haste", an effect on them, whatever it copied.
    expect(keywords(game, copied[0]).has("haste")).toBe(true);
    expect(keywords(game, copied[0]).has("flying")).toBe(true);
    expect(keywords(game, other[0]).has("haste")).toBe(true);

    // Exiled at the next end step, the copy that copied something else too.
    game.advanceUntil((s) => s.turn.step === "cleanup" || tokens(game).length === 0);
    settle(game);
    expect(tokens(game)).toHaveLength(0);
  });

  it("each copy of a Clone chooses for itself (Rite of Replication, kicked)", () => {
    const { game, a } = table();
    const clone = spawnClone(game);
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const choices = [angel, bears, angel, bears, null];
    let asked = 0;
    a.chooseCopyFn = () => choices[asked++];
    lands(game, "Island", 9);
    cast(game, toHand(game, "Rite of Replication"), { targets: [ref(clone)], kicked: true });
    expect(asked).toBe(5);
    expect(tokens(game, "Serra Angel")).toHaveLength(2);
    expect(tokens(game, "Grizzly Bears")).toHaveLength(2);
    // Copying nothing, it's a 0/0, gone at once.
    expect(tokens(game, "Clone")).toHaveLength(0);
  });

  it("the Clone's copy replaces the first copy's exception, not what happens to the token (Kiki-Jiki)", () => {
    const { game, a } = table();
    const clone = spawnClone(game);
    const angel = spawn(game, "Serra Angel", B);
    const kiki = spawn(game, "Kiki-Jiki, Mirror Breaker");
    game.state.objects[kiki].summoningSick = false;
    a.chooseCopyFn = () => angel;
    activate(game, kiki, 0, { targets: [ref(clone)] });

    const [token] = tokens(game, "Serra Angel");
    expect(token).toBeDefined();
    expect(keywords(game, token).has("haste")).toBe(false); // rule 707.3
    game.advanceUntil((s) => s.turn.step === "cleanup" || tokens(game).length === 0);
    settle(game);
    expect(tokens(game)).toHaveLength(0); // still sacrificed
  });

  it("keeps the copy's exceptions when the Clone copies nothing (Ember Island Production)", () => {
    const { game, a } = table();
    const clone = spawnClone(game);
    a.chooseCopyFn = () => null;
    lands(game, "Island", 5);
    cast(game, toHand(game, "Ember Island Production"), { modes: [0], targets: [ref(clone)] });
    const [token] = tokens(game, "Clone");
    expect(token).toBeDefined();
    expect(pt(game, token)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, token)).toContain("Hero");
  });

  it("makes an opponent's creature yours as a Coward that isn't legendary (Ember Island Production)", () => {
    const { game } = table();
    const legend = spawn(game, "Kiki-Jiki, Mirror Breaker", B);
    lands(game, "Island", 5);
    cast(game, toHand(game, "Ember Island Production"), { modes: [1], targets: [ref(legend)] });
    const [token] = tokens(game, "Kiki-Jiki, Mirror Breaker");
    expect(game.state.objects[token].controller).toBe(A);
    expect(pt(game, token)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, token)).toContain("Coward");
    expect(game.state.objects[token].notLegendary).toBe(true);
  });

  it("asks an Aura token what it enchants, not by targeting (rule 303.4f)", () => {
    const { game, a } = table();
    const host = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Serra Angel", B);
    const aura = spawn(game, "Pacifism");
    game.state.objects[aura].attachedTo = host;
    let offered: readonly ObjectId[] = [];
    a.chooseEnchantFn = (_view, _source, options) => {
      offered = options;
      return second;
    };
    replicate(game, aura);
    expect(offered).toEqual(expect.arrayContaining([host, second]));
    const [token] = tokens(game, "Pacifism");
    expect(game.state.objects[token].attachedTo).toBe(second);
  });

  it("creates no Aura token with nothing to enchant, and asks nothing (rule 303.4g)", () => {
    const { game, a } = table();
    const aura = spawn(game, "Pacifism");
    let asked = false;
    a.chooseEnchantFn = (_view, _source, options) => {
      asked = true;
      return options[0];
    };
    replicate(game, aura);
    expect(asked).toBe(false);
    expect(Object.values(game.state.objects).filter((o) => o.isToken)).toHaveLength(0);
  });

  it("an Aura that would be a creature can enchant nothing (Astral Dragon's ruling, rule 303.4d)", () => {
    const { game, a } = table();
    const host = spawn(game, "Grizzly Bears", B);
    const aura = spawn(game, "Pacifism", B);
    game.state.objects[aura].attachedTo = host;
    let asked = false;
    a.chooseEnchantFn = (_view, _source, options) => {
      asked = true;
      return options[0];
    };
    a.chooseTargetsFn = () => [ref(aura)];
    lands(game, "Island", 8);
    cast(game, toHand(game, "Astral Dragon"));
    expect(zone(game, aura)).toBe("battlefield");
    expect(asked).toBe(false);
    expect(Object.values(game.state.objects).filter((o) => o.isToken)).toHaveLength(0);
  });

  it("leaves a copy with nothing to settle as it was, stacked if it can be (Rite of Replication)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 9);
    cast(game, toHand(game, "Rite of Replication"), { targets: [ref(bears)], kicked: true });
    const made = tokens(game, "Grizzly Bears");
    expect(made.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(5);
    expect(Object.values(game.state.objects).filter((o) => o.zone === "outside")).toHaveLength(0);
  });

  it("a would-create-token replacement still comes first: no copy, nothing asked (Divine Visitation)", () => {
    const { game, a } = table();
    spawn(game, "Divine Visitation");
    const clone = spawnClone(game);
    let asked = false;
    a.chooseCopyFn = () => {
      asked = true;
      return null;
    };
    replicate(game, clone);
    expect(asked).toBe(false);
    expect(tokens(game, "Clone")).toHaveLength(0);
    expect(tokens(game)).toHaveLength(1);
  });
});
